import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    username: {
      type: String,
      required: [true, "Please add a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be longer than 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, hyphen, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 8,
      select: false,
    },

    photo: {
      type: String,
      default:
        "https://avatars.githubusercontent.com/u/129030131?s=400&u=c23568f265e3102a5f17e07dd0ebf4cfbe7f199a&v=4",
    },

    bio: {
      type: String,
      default: "I am a new user",
    },

    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "creator"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
