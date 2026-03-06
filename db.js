app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({
        status: "error",
        message: "Login va parol kiriting!"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: "error",
        message: "Foydalanuvchi topilmadi!"
      });
    }

    const user = result.rows[0];

    // Parol mavjudligini tekshirish
    if (!user.password) {
      return res.json({
        status: "error",
        message: "Parol bazada topilmadi"
      });
    }

    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.json({
        status: "error",
        message: "Parol noto'g'ri!"
      });
    }

    res.json({
      status: "ok",
      message: "Kirish muvaffaqiyatli!",
      username: user.username,
      profileType: user.profiletype
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      status: "error",
      message: "Server xatoligi"
    });
  }
});
