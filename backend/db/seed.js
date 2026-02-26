require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("../src/models");

async function seedDatabase() {
  try {
    console.log("Syncing database...");

    await db.sequelize.query("CREATE SCHEMA IF NOT EXISTS security;");

    // 2. Désactiver temporairement les contraintes pour éviter l'erreur Groups/Users
    await db.sequelize.query("SET CONSTRAINTS ALL DEFERRED");

    // 1. Créer les tables sans relations d'abord (ou celles qui sont référencées)
    await db.Groups.sync({ force: true });
    await db.Permissions.sync({ force: true });
    await db.Sizes.sync({ force: true });
    await db.Themes.sync({ force: true });

    // 2. Créer les tables qui dépendent des premières
    await db.Users.sync({ force: true });
    await db.GroupPermission.sync({ force: true });

    // 3. Créer le reste (Designs, Orders, etc.)
    await db.sequelize.sync({ force: false }); // force: false pour ne pas écraser ce qu'on vient de faire    console.log('✓ Database synced\n');

    // ==================== CREATE PERMISSIONS ====================
    console.log("📋 Creating permissions...");
    const permissions = {};

    const permList = [
      { name: "*:*", description: "Full admin access" },
      { name: "design:read", description: "Read designs" },
      { name: "design:create", description: "Create designs" },
      { name: "design:update:own", description: "Update own designs" },
      { name: "design:update:all", description: "Update all designs" },
      { name: "design:delete", description: "Delete designs" },
      { name: "design:publish", description: "Publish designs" },
      { name: "self:*", description: "Full access to own account" },
      { name: "self:create", description: "Create own account" },
      { name: "order:create", description: "Create orders" },
      { name: "order:read", description: "Read orders" },
      { name: "invoice:read", description: "Read invoices" },
    ];

    for (const perm of permList) {
      const [permission] = await db.Permissions.findOrCreate({
        where: { name: perm.name },
        defaults: { name: perm.name },
      });
      permissions[perm.name] = permission;
      console.log(`  ✓ ${perm.name}`);
    }

    // ==================== CREATE GROUPS ====================
    console.log("\n👥 Creating groups...");
    const groups = {};

    // Admin group
    const [adminGroup] = await db.Groups.findOrCreate({
      where: { name: "Admin" },
      defaults: { name: "Admin" },
    });
    groups.Admin = adminGroup;
    console.log("  ✓ Admin");

    // Guest group
    const [guestGroup] = await db.Groups.findOrCreate({
      where: { name: "Guest" },
      defaults: { name: "Guest" },
    });
    groups.Guest = guestGroup;
    console.log("  ✓ Guest");

    // UserBuyer group
    const [buyerGroup] = await db.Groups.findOrCreate({
      where: { name: "UserBuyer" },
      defaults: { name: "UserBuyer" },
    });
    groups.UserBuyer = buyerGroup;
    console.log("  ✓ UserBuyer");

    // UserCreator group
    const [creatorGroup] = await db.Groups.findOrCreate({
      where: { name: "UserCreator" },
      defaults: { name: "UserCreator" },
    });
    groups.UserCreator = creatorGroup;
    console.log("  ✓ UserCreator");

    // DesignManager group
    const [managerGroup] = await db.Groups.findOrCreate({
      where: { name: "DesignManager" },
      defaults: { name: "DesignManager" },
    });
    groups.DesignManager = managerGroup;
    console.log("  ✓ DesignManager");

    // ==================== ASSIGN PERMISSIONS TO GROUPS ====================
    console.log("\n🔐 Assigning permissions to groups...");

    // Admin: *:*
    const adminPerms = ["*:*"];
    for (const permName of adminPerms) {
      await db.GroupPermission.findOrCreate({
        where: {
          groupId: adminGroup.id,
          permissionId: permissions[permName].id,
        },
        defaults: {
          groupId: adminGroup.id,
          permissionId: permissions[permName].id,
        },
      });
    }
    console.log("  ✓ Admin: *:*");

    // Guest: design:read, self:create
    const guestPerms = ["design:read", "self:create"];
    for (const permName of guestPerms) {
      await db.GroupPermission.findOrCreate({
        where: {
          groupId: guestGroup.id,
          permissionId: permissions[permName].id,
        },
        defaults: {
          groupId: guestGroup.id,
          permissionId: permissions[permName].id,
        },
      });
    }
    console.log("  ✓ Guest: design:read, self:create");

    // UserBuyer: self:*, order:create, order:read, invoice:read
    const buyerPerms = ["self:*", "order:create", "order:read", "invoice:read"];
    for (const permName of buyerPerms) {
      await db.GroupPermission.findOrCreate({
        where: {
          groupId: buyerGroup.id,
          permissionId: permissions[permName].id,
        },
        defaults: {
          groupId: buyerGroup.id,
          permissionId: permissions[permName].id,
        },
      });
    }
    console.log(
      "  ✓ UserBuyer: self:*, order:create, order:read, invoice:read",
    );

    // UserCreator: UserBuyer permissions + design:create, design:update:own
    const creatorPerms = [
      "self:*",
      "order:create",
      "order:read",
      "invoice:read",
      "design:create",
      "design:update:own",
      "design:read",
    ];
    for (const permName of creatorPerms) {
      await db.GroupPermission.findOrCreate({
        where: {
          groupId: creatorGroup.id,
          permissionId: permissions[permName].id,
        },
        defaults: {
          groupId: creatorGroup.id,
          permissionId: permissions[permName].id,
        },
      });
    }
    console.log(
      "  ✓ UserCreator: UserBuyer + design:create, design:update:own, design:read",
    );

    // DesignManager: design:update:all, design:delete, design:publish
    const managerPerms = [
      "design:update:all",
      "design:delete",
      "design:publish",
      "design:read",
    ];
    for (const permName of managerPerms) {
      await db.GroupPermission.findOrCreate({
        where: {
          groupId: managerGroup.id,
          permissionId: permissions[permName].id,
        },
        defaults: {
          groupId: managerGroup.id,
          permissionId: permissions[permName].id,
        },
      });
    }
    console.log(
      "  ✓ DesignManager: design:update:all, design:delete, design:publish, design:read",
    );

    // ==================== CREATE SIZES & THEMES ====================
    console.log("\n📐 Creating sizes...");
    const sizes = {};
    const sizeData = [
      { name: "A4", multiplier: 1.0 },
      { name: "A3", multiplier: 1.5 },
      { name: "A2", multiplier: 2.0 },
    ];
    for (const s of sizeData) {
      const [size] = await db.Sizes.findOrCreate({
        where: { name: s.name },
        defaults: { name: s.name, priceMultiplier: s.multiplier },
      });
      sizes[s.name] = size;
      console.log(`  ✓ ${s.name}`);
    }

    console.log("\n🎨 Creating themes...");
    const themes = {};
    const themeData = [
      { name: "Cyberpunk" },
      { name: "Anime" },
      { name: "Arcane" },
      { name: "Dark Fantasy" },
      { name: "Minimalist" },
    ];
    for (const t of themeData) {
      const [theme] = await db.Themes.findOrCreate({
        where: { name: t.name },
        defaults: { name: t.name },
      });
      themes[t.name] = theme;
      console.log(`  ✓ ${t.name}`);
    }

    // ==================== CREATE USERS ====================
    console.log("\n👤 Creating test users...");
    const users = {};

    const userData = [
      {
        email: "admin@postered.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "Postered",
        group: "Admin",
      },
      {
        email: "buyer@postered.com",
        password: "buyer123",
        firstName: "John",
        lastName: "Lenon",
        group: "UserBuyer",
      },
      {
        email: "creator@postered.com",
        password: "creator123",
        firstName: "Jane",
        lastName: "Austen",
        group: "UserCreator",
      },
      {
        email: "manager@postered.com",
        password: "manager123",
        firstName: "Mike",
        lastName: "Ross",
        group: "DesignManager",
      },
    ];

    for (const u of userData) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const [user] = await db.Users.findOrCreate({
        where: { email: u.email },
        defaults: {
          email: u.email,
          password: hashedPassword,
          firstName: u.firstName,
          lastName: u.lastName,
          groupId: u.groupId || groups[u.group].id,
        },
      });
      users[u.email] = user;
      console.log(`  ✓ ${u.email} (${u.group})`);
    }

    // ==================== CREATE SAMPLE DATA ====================
    console.log("\n🎨 Creating sample designs...");
    const designs = [];
    const designData = [
      {
        title: "Arcane: Jinx & Vi",
        description:
          "L'affrontement tragique entre les deux sœurs de Piltover et Zaun.",
        price: 45.0,
        imageUrl:
          "https://i.pinimg.com/736x/b3/a4/3c/b3a43ccdcf0a98de907e9c57d676f232.jpg",
        themeId: themes["Arcane"].id,
        status: "APPROVED",
        sizeId: sizes.A2.id,
        validatorId: users["manager@postered.com"].id,
      },
      {
        title: "Frieren: Beyond Journey's End",
        description: "Une fresque mélancolique sur le passage du temps.",
        price: 35.0,
        imageUrl:
          "https://media.printler.com/media/photo/185948.jpg?rmode=crop&width=638&height=900",
        themeId: themes["Anime"].id,
        status: "PENDING",
        sizeId: sizes.A3.id,
        validatorId: null,


      },
      {
        title: "Night City Lights",
        description: "L'esthétique néon brutale de Cyberpunk 2077.",
        price: 29.99,
        imageUrl:
          "https://m.media-amazon.com/images/I/71MdlxYxupL._AC_UF1000,1000_QL80_.jpg",
        themeId: themes["Cyberpunk"].id,
        status: "APPROVED",
        sizeId: sizes.A2.id,
        validatorId: users["manager@postered.com"].id,
      },
      {
        title: "Berserk: The Black Swordsman",
        description: "L'éclipse et la fureur de Guts.",
        price: 55.0,
        imageUrl:
          "https://media.printler.com/media/photo/197132-1.jpg?rmode=crop&width=638&height=900",
        themeId: themes["Dark Fantasy"].id,
        status: "APPROVED",
        sizeId: sizes.A2.id,
        validatorId: users["manager@postered.com"].id,
      },
      {
        title: "The Tarnished One",
        description: "Inspiré par Elden Ring, le voyage vers l'Arbre-Monde.",
        price: 49.0,
        imageUrl: "https://res.cloudinary.com/cook-becker/image/fetch/q_auto:best,f_auto,w_1920,g_center/https://candb.com/site/candb/images/article/Godfrey.jpg",
        themeId: themes["Dark Fantasy"].id,
        status: "APPROVED",
        sizeId: sizes.A2.id,
        validatorId: users["manager@postered.com"].id,
      },
      {
        title: "Spirited Away: Bathhouse",
        description: "L'élégance onirique du chef-d'œuvre de Miyazaki.",
        price: 32.50,
        imageUrl: "https://static.wikia.nocookie.net/studio-ghibli/images/8/80/Chihiro_sees_the_Bathhouse.png/revision/latest?cb=20200914124155",
        themeId: themes["Anime"].id,
        status: "APPROVED",
        sizeId: sizes.A3.id,
        validatorId: users["manager@postered.com"].id,
      },
      {
        title: "Into the Spider-Verse",
        description: "Miles Morales plonge dans le chaos du multivers.",
        price: 38.0,
        imageUrl: "https://cdn.displate.com/artwork/460x640/2025-11-10/d74842503806aa8511707f4de8b6eb83_fcc5c31bfee0c6ead3af8b040d7c60a1.jpg",
        themeId: themes["Cyberpunk"].id, 
        status: "APPROVED",
        sizeId: sizes.A2.id,
        validatorId: users["manager@postered.com"].id,
      },
      {
        title: "The Last of Us Part II",
        description: "Une Ellie déterminée dans la verdure post-apocalyptique.",
        price: 40.0,
        imageUrl: "https://cdnb.artstation.com/p/assets/images/images/028/576/365/large/brandon-meier-ellie-and-dina-ml.jpg?1594858855",
        themeId: themes["Dark Fantasy"].id,
        status: "PENDING",
        sizeId: sizes.A2.id,
        validatorId: null,
      }
    ];
await db.Designs.sync({ force: true }); 

    for (const d of designData) {
      const design = await db.Designs.create({
        title: d.title,
        description: d.description,
        imageUrl: d.imageUrl,
        designerId: users["creator@postered.com"].id,
        basePrice: d.price,
        status: d.status,
        themeId: d.themeId,
        sizeId: d.sizeId,
        validatorId: d.validatorId,
        validatedAt: d.status === "APPROVED" ? new Date() : null,
      });

      // Si tu as des tables de liaison Many-to-Many, garde ceci, 
      // sinon si c'est du BelongsTo (Foreign Key simple), c'est déjà fait au-dessus.
      if (d.sizeId && typeof design.addSize === "function") await design.addSize(d.sizeId);
      if (d.themeId && typeof design.addTheme === "function") await design.addTheme(d.themeId);

      designs.push(design);
      console.log(`  ✓ ${d.title} (${d.status})`);
    }
    console.log(
      "Done !",
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
