import bcrypt from "bcrypt";

export const hashPassword = async (passwrod) => {
    try {

        const saltRoutd = 5;
        const hashedpassword = await bcrypt.hash(passwrod, saltRoutd)
        return hashedpassword;

    } catch (error) {
        console.log(error)
    }
}

export const comparePassword = async (passwrod, hashedpassword) => {
    return bcrypt.compare(passwrod, hashedpassword)
}