import { comparePassword, hashPassword } from "../helper/authhelper.js";
import userModels from "../models/userModels.js";
import JWT from "jsonwebtoken";
import { transporter } from "../utils/function.js";
import { generatresendotp } from "../utils/function.js";


const registercontroller = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // Validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory."
            });
        }

        // Check if user already exists
        const existingUser = await userModels.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered. Please login."
            });
        }

        // Send OTP via email
        const otp = generatresendotp();
        const mailOptions = {
            from: 'sksatenderkumar59@gmail.com',
            to: email,
            subject: 'OTP for Registration',
            text: `Your OTP for registration is: ${otp}`,
        };
        await transporter.sendMail(mailOptions);



        // Hash password
        const hashedPassword = await hashPassword(password);

        // Save user data
        const user = await new userModels({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            otp,
            isverify: false,
            otptime: Date.now()
        }).save();

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error in registration.",
            error
        });
    }
};
const otpverify = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }
        const user = await userModels.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

       
        if (user.otp !== +otp) {
            
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }

      
        const currentTime = Date.now();
        const otpExpirationTime = user.otptime + 900000;

        if (currentTime >= +otpExpirationTime) {
            return res.status(401).json({
                success: false,
                message: "OTP has expired"
            });
        }

       
        user.isverify = true;
        user.otp = 0;
        await user.save();

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error from verify api", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
const resendotp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModels.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email id" });
        }

        if (user.isverify) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        // Generate new OTP
        const otp = generatresendotp();
        user.otp = otp;
        user.otptime = Date.now();
        await user.save();

        // Send OTP via email
        const mailOptions = {
            from: 'sksatenderkumar59@gmail.com',
            to: email,
            subject: 'Re-Send OTP for Registration',
            text: `Your Resend OTP for registration is: ${otp}`,
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error in server",
        });
    }
};
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password. All fields are mandatory."
            });
        }

        // Check user existence
        const user = await userModels.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email is not registered."
            });
        }

        // Compare password
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid password."
            });
        }

        // Generate JWT token
        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                userId : user._id
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error in login.",
            error
        });
    }
};
const forgetPassword = async (req, res) => {
    const { email } = req.body;
   
    try {
       
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

       
        const user = await userModels.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

       
        const otp = generatresendotp(); 
        const otpExpirationTime = Date.now() + 900000;
      
        const mailOptions = {
            from: 'sksatenderkumar59@gmail.com',
            to: email,
            subject: 'OTP for forget Password',
            text: `Your OTP for Forget Password is: ${otp}`,
        };
        await transporter.sendMail(mailOptions);
       
        user.otp = otp;
        user.otptime = otpExpirationTime;
        await user.save();

      

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Error from forget password api", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
const updatePassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        // Validate email, OTP, and new password
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid email, OTP, and a new password"
            });
        }

        // Find the user by email
        const user = await userModels.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if OTP matches and is not expired
        if (user.otp !== +otp || Date.now() >= user.otptime) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP or OTP has expired"
            });
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Error from update password API:", error);
        return res.status(500).json({ message: "Something went wrong", error });
    }
};
const tokenVerify = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const accessToken = token.split(' ')[1];

        JWT.verify(accessToken, process.env.JWT_SECRET, async (error, decoded) => {
            if (error) {
                return res.status(401).json({ success: false, message: "Invalid token" });
            }
            const userData = await userModels.findById(decoded._id);

            if (!userData) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.status(200).json({
                success: true,
                user: userData,
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by userId
        const user = await userModels.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user details",
            error: error.message
        });
    }
};








export { registercontroller,getUserDetails, loginController, otpverify, resendotp ,forgetPassword, updatePassword,tokenVerify};
