import userModels from "../models/userModels.js";

const createShipping = async (req, res) => {
    try {
        const { userId, city, landmark, state, pincode } = req.body;
        const user = await userModels.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const userAddress = user.address || {};     
        if (!city || !state || !landmark || !pincode) {
            return res.status(400).json({
                success: false,
                message: "Address fields are empty"
            });
        } 
        userAddress.city = city;
        userAddress.state = state;
        userAddress.landmark = landmark;
        userAddress.pincode = pincode;

       
        await user.save();

        res.status(200).json({
            success: true,
            message: "Shipping details saved successfully"
        });
    } catch (error) {
        console.error("Error saving shipping details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save shipping details",
            error: error.message
        });
    }
};

export { createShipping };
