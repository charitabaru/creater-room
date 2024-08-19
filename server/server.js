import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

//import schemas
import User from "./models/User.js";
import Blog from "./models/Blog.js";
import { count } from "console";
import { title } from "process";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
  })
);

const port = process.env.PORT;
const SALT_ROUNDS = 10;

//Google sign-up initialization
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

app.use(express.json());

//DataBase connection
mongoose
  .connect(process.env.DB_LOCATION, {
    autoIndex: true,
  })
  .then(async () => {
    console.log("Connected to database");
    try {
      const result = await User.updateMany({}, { $set: { blog_Banner: {} } });
      console.log(`Updated ${result.modifiedCount} documents`);
    } catch (error) {
      console.error("Error updating schema:", error);
    }
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

async function generateUsername(email) {
  let username = email.split("@")[0];
  let isUserNameNotUnique = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUserNameNotUnique ? (username += nanoid().substring(0, 4)) : "";

  return username;
}

function formataSendData(user) {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = decoded.id;
    next();
  });
};

//sign-up route
app.post("/signup", async (req, res) => {
  let { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "full name should be more that 3 letters" });
  }

  if (!email.length) {
    return res.status(403).json({ error: "Enter email" });
  }

  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Enter a valid email" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password should be 6-20 characters long, include at least one uppercase letter, one lowercase letter, and one numeric digit",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let username = await generateUsername(email);

    let user = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formataSendData(u));
      })
      .catch((error) => {
        if (error.code == 11000) {
          return res.status(500).json({ error: " Email already exists " });
        }

        return res.status(500).json({ error: error.message });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//sign-in route
app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return res.status(403).json({ error: "Email not found" });
    }

    if (!user.google_auth) {
      const isMatch = await bcrypt.compare(
        password,
        user.personal_info.password
      );

      if (!isMatch) {
        return res.status(403).json({ error: "Invalid password" });
      } else {
        return res.status(200).json(formataSendData(user));
      }
    } else {
      return res.status(403).json({
        error:
          "Account was already created using google. Try logging in with google",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//google-auth route
app.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: "Access token is required" });
  }

  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodeduser) => {
      let { email, name } = decodeduser;

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => u)
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        // Login
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This Email is already signed up without Google. Please login with password.",
          });
        }
      } else {
        // Signup
        let username = await generateUsername(email);

        user = new User({
          personal_info: {
            fullname: name,
            email,
            username,
          },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
      return res.status(200).json(formataSendData(user));
    })
    .catch((err) => {
      console.error("Error verifying Google token:", err);
      return res.status(500).json({
        error:
          "Failed to authenticate with Google, try with another Google account",
      });
    });
});

//uploading image banner in editor page
app.post(
  "/upload-banner",
  verifyToken,
  upload.single("banner"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const banner_url = `http://localhost:3005/uploads/${req.file.filename}`;

    try {
      await User.findByIdAndUpdate(req.userId, {
        "blog_Banner.banner_image": banner_url,
      });

      res.json({ banner_url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error saving banner" });
    }
  }
);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

//finding latest-blogs
app.post("/latest-blogs", (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//latest-blogs-countRoute
app.post("/all-latest-blogs-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//search-blogs-countRoute
app.post("/search-blogs-count", (req, res) => {
  let { query, tag } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }
  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//setting up trending-blogs
app.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//Filtreing
app.post("/search-blogs", (req, res) => {
  let { query, tag, page } = req.body;
  let findQuery;

  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }

  let maxLimit = 2;
  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

app.post("/search-users", (req, res) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, "i") })
    .limit(50)
    .select(
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .then((users) => {
      return res.status(200).json({ users });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//to get User profile
app.post("/get-profile", (req, res) => {
  let {username} = req.body;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//Publish to create a blog
app.post("/create-blog", verifyToken, (req, res) => {
  let authorId = req.userId;
  let { title, des, banner, content, tags, draft } = req.body;

  if (!title) {
    return res.status(403).json({ error: "You must provide a title." });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide the description with in 200 characters.",
      });
    }
    if (!banner.length) {
      return res.status(403).json({
        error: "You must upload the banner image to publish the blog.",
      });
    }
    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it." });
    }
    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error:
          "Provide the tags in order to publish the blog, maximum limit 10.",
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());
  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/\s+/g, "-")
      .trim() + nanoid();

  let blog = new Blog({
    title,
    banner,
    des,
    content,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let incrementvalue = draft ? 0 : 1;
      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementvalue },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Failed to update total posts number" });
        });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
});

app.listen(port, () => {
  console.log(`server is listening on port ${port} `);
});
