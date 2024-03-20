import userModels from "../models/userModels.js";

const createShipping = async (req, res) => {
  try {
    const { userId, city, address, state, pincode } = req.body;
    const user = await userModels.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userAddress = user.address || {};
    if (!city || !state || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Some Address field is empty",
      });
    }
    userAddress.city = city;
    userAddress.state = state;
    userAddress.address = address;
    userAddress.pincode = pincode;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Shipping details saved successfully",
    });
  } catch (error) {
    console.error("Error saving shipping details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save shipping details",
      error: error.message,
    });
  }
};

export { createShipping };
