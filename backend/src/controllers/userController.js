export const getCurrentUser = async (req, res) => {
    try {
        // req.user is already populated by protectRoute
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = req.user;

        // Validate role
        if (!role || !["teacher", "student"].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'teacher' or 'student'" });
        }

        // Only allow setting role if it's currently null (first time)
        if (user.role !== null && user.role !== undefined) {
            return res.status(403).json({ error: "Role already set and cannot be changed" });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: "Role updated successfully", user });
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
