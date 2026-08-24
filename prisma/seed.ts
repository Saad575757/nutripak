/**
 * Development seed data for the Nutripak Admin Dashboard.
 *
 * All product content is PLACEHOLDER data clearly marked as such — no real
 * Nutripak production claims, ingredients or certifications are invented here.
 * Every order uses Cash on Delivery (COD) exclusively.
 *
 * Usage: npx tsx prisma/seed.ts   (or `npx prisma db seed`)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const PLACEHOLDER = "[Placeholder]";

type ProductSeed = {
  slug: string;
  name: string;
  sku: string;
  categorySlug: string;
  price: number;
  stockQuantity: number;
  shortDescription: string;
  fullDescription: string;
  ingredients: string;
  benefits: string;
  nutritionInfo: string;
  certifications: string;
  images: string[];
};

const categories = [
  {
    name: "Nutritional Supplements",
    slug: "nutritional-supplements",
    description:
      "[Placeholder] Everyday multivitamins and mineral supplements supporting general wellness.",
  },
  {
    name: "Therapeutic Nutrition",
    slug: "therapeutic-nutrition",
    description:
      "[Placeholder] Clinically oriented nutrition products for specific dietary needs.",
  },
  {
    name: "Sports Nutrition",
    slug: "sports-nutrition",
    description:
      "[Placeholder] Protein, creatine and hydration products for active lifestyles.",
  },
];

const products: ProductSeed[] = [
  {
    slug: "subset-daily-multivitamin",
    name: "SUBSET Daily Multivitamin",
    sku: "NPK-SUB-001",
    categorySlug: "nutritional-supplements",
    price: 2450,
    stockQuantity: 48,
    shortDescription: `${PLACEHOLDER} Complete daily multivitamin with 21 essential nutrients.`,
    fullDescription: `${PLACEHOLDER} SUBSET is a once-daily multivitamin tablet formulated to support everyday energy, immunity and general wellbeing. This description is placeholder development content only.`,
    ingredients: `${PLACEHOLDER} Vitamin A, Vitamin C, Vitamin D3, Vitamin E, Vitamin K, B-Complex, Zinc, Magnesium, Iron, Iodine, Selenium.`,
    benefits: `${PLACEHOLDER} Supports immune function, reduces tiredness and fatigue, supports normal cognitive function.`,
    nutritionInfo: `${PLACEHOLDER} Per tablet: Energy 2 kcal, Carbohydrates 0.4 g, of which sugars 0 g, Fat 0 g.`,
    certifications: `${PLACEHOLDER} GMP, DRAP enlisted.`,
    images: ["/products/subset.svg"],
  },
  {
    slug: "ada-glu-energy-mix",
    name: "ADA-Glu Energy Mix",
    sku: "NPK-ADA-002",
    categorySlug: "therapeutic-nutrition",
    price: 1850,
    stockQuantity: 8,
    shortDescription: `${PLACEHOLDER} Oral glucose-based energy drink mix for rapid replenishment.`,
    fullDescription: `${PLACEHOLDER} ADA-Glu is a glucose polymer drink mix designed for quick energy supply and hydration support. Placeholder content for development purposes.`,
    ingredients: `${PLACEHOLDER} Maltodextrin, Dextrose monohydrate, Sodium chloride, Potassium citrate, Natural flavouring.`,
    benefits: `${PLACEHOLDER} Fast-acting energy source, supports electrolyte balance during recovery.`,
    nutritionInfo: `${PLACEHOLDER} Per 100 g: Energy 380 kcal, Carbohydrates 94 g, of which sugars 38 g, Sodium 420 mg.`,
    certifications: `${PLACEHOLDER} GMP.`,
    images: ["/products/ada-glu.svg"],
  },
  {
    slug: "proteios-whey-blend",
    name: "Proteios Whey Blend",
    sku: "NPK-PRT-003",
    categorySlug: "sports-nutrition",
    price: 7950,
    stockQuantity: 0,
    shortDescription: `${PLACEHOLDER} Chocolate whey protein blend, 24 g protein per serving.`,
    fullDescription: `${PLACEHOLDER} Proteios is a whey concentrate/isolate blend delivering 24 g of protein per scoop to support muscle repair and growth. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} Whey protein concentrate, Whey protein isolate, Cocoa powder, Lecithin, Xanthan gum, Sucralose.`,
    benefits: `${PLACEHOLDER} Supports muscle growth and repair, convenient post-workout protein source.`,
    nutritionInfo: `${PLACEHOLDER} Per 30 g serving: Energy 118 kcal, Protein 24 g, Carbohydrates 2.1 g, Fat 1.4 g.`,
    certifications: `${PLACEHOLDER} GMP, Halal certified.`,
    images: ["/products/proteios.svg"],
  },
  {
    slug: "nutrikids-chewable",
    name: "NutriKids Chewable Multivitamin",
    sku: "NPK-KID-004",
    categorySlug: "nutritional-supplements",
    price: 1650,
    stockQuantity: 120,
    shortDescription: `${PLACEHOLDER} Fruit-flavoured chewable multivitamin for children aged 4+.`,
    fullDescription: `${PLACEHOLDER} NutriKids provides age-appropriate levels of key vitamins in a kid-friendly chewable format. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} Vitamin A, Vitamin C, Vitamin D3, B-Complex, Zinc.`,
    benefits: `${PLACEHOLDER} Supports healthy growth, appetite and immunity in children.`,
    nutritionInfo: `${PLACEHOLDER} Per tablet: Energy 1.5 kcal, Carbohydrates 0.35 g, of which sugars 0.1 g.`,
    certifications: `${PLACEHOLDER} GMP.`,
    images: ["/products/nutrikids.svg"],
  },
  {
    slug: "omega-3-capsules",
    name: "Omega-3 Fish Oil Capsules",
    sku: "NPK-OMG-005",
    categorySlug: "nutritional-supplements",
    price: 3250,
    stockQuantity: 6,
    shortDescription: `${PLACEHOLDER} 1000 mg fish oil softgels providing EPA and DHA.`,
    fullDescription: `${PLACEHOLDER} High-purity fish oil softgels standardised to EPA and DHA for heart and brain health. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} Fish oil (anchovy, sardine), Gelatin, Glycerol, Vitamin E (antioxidant).`,
    benefits: `${PLACEHOLDER} Contributes to normal heart and brain function, supports vision.`,
    nutritionInfo: `${PLACEHOLDER} Per capsule: Energy 9 kcal, Fat 1 g, of which EPA 180 mg, DHA 120 mg.`,
    certifications: `${PLACEHOLDER} GMP, IFOS tested.`,
    images: ["/products/omega.svg"],
  },
  {
    slug: "calcium-d3-tablets",
    name: "Calcium+D3 Tablets",
    sku: "NPK-CA-006",
    categorySlug: "therapeutic-nutrition",
    price: 1450,
    stockQuantity: 75,
    shortDescription: `${PLACEHOLDER} Calcium carbonate with vitamin D3 for bone health.`,
    fullDescription: `${PLACEHOLDER} Combines 500 mg elemental calcium with 400 IU vitamin D3 per tablet to support bone density. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} Calcium carbonate, Cholecalciferol (Vitamin D3), Microcrystalline cellulose.`,
    benefits: `${PLACEHOLDER} Supports healthy bones and teeth, aids calcium absorption.`,
    nutritionInfo: `${PLACEHOLDER} Per tablet: Calcium 500 mg, Vitamin D3 10 µg.`,
    certifications: `${PLACEHOLDER} GMP.`,
    images: ["/products/calcium-d3.svg"],
  },
  {
    slug: "creatine-monohydrate",
    name: "Creatine Monohydrate Powder",
    sku: "NPK-CRT-007",
    categorySlug: "sports-nutrition",
    price: 4850,
    stockQuantity: 32,
    shortDescription: `${PLACEHOLDER} Micronised creatine monohydrate, 250 g tub.`,
    fullDescription: `${PLACEHOLDER} Unflavoured micronised creatine monohydrate supporting high-intensity performance. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} 100% Creatine monohydrate.`,
    benefits: `${PLACEHOLDER} Improves strength and power output, supports training volume.`,
    nutritionInfo: `${PLACEHOLDER} Per 5 g serving: Energy 0 kcal, Creatine monohydrate 5 g.`,
    certifications: `${PLACEHOLDER} GMP, Informed Sport tested.`,
    images: ["/products/creatine.svg"],
  },
  {
    slug: "iron-folic-tablets",
    name: "Iron+Folic Acid Tablets",
    sku: "NPK-FE-008",
    categorySlug: "therapeutic-nutrition",
    price: 950,
    stockQuantity: 0,
    shortDescription: `${PLACEHOLDER} Gentle iron with folic acid for daily supplementation.`,
    fullDescription: `${PLACEHOLDER} Combines ferrous bisglycinate with folic acid, commonly used during pregnancy and anaemia management. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} Ferrous bisglycinate, Folic acid, Vitamin C, Microcrystalline cellulose.`,
    benefits: `${PLACEHOLDER} Reduces tiredness and fatigue, supports normal formation of red blood cells.`,
    nutritionInfo: `${PLACEHOLDER} Per tablet: Iron 28 mg, Folic acid 400 µg, Vitamin C 50 mg.`,
    certifications: `${PLACEHOLDER} GMP.`,
    images: ["/products/iron-folic.svg"],
  },
  {
    slug: "electrolyte-sachets",
    name: "Electrolyte Hydration Sachets",
    sku: "NPK-ELE-009",
    categorySlug: "sports-nutrition",
    price: 1250,
    stockQuantity: 14,
    shortDescription: `${PLACEHOLDER} ORS-style electrolyte sachets, box of 20.`,
    fullDescription: `${PLACEHOLDER} Balanced electrolyte powder sachets for rapid rehydration during training or heat exposure. Placeholder development copy.`,
    ingredients: `${PLACEHOLDER} Dextrose, Sodium citrate, Potassium chloride, Sodium chloride.`,
    benefits: `${PLACEHOLDER} Restores fluid and electrolyte balance, helps prevent cramping.`,
    nutritionInfo: `${PLACEHOLDER} Per sachet: Energy 15 kcal, Sodium 480 mg, Potassium 195 mg, Carbohydrates 3.6 g.`,
    certifications: `${PLACEHOLDER} GMP.`,
    images: ["/products/electro.svg"],
  },
];

const customers = [
  {
    name: "Ahmed Raza",
    phone: "+92 300 1234567",
    email: "ahmed.raza@example.com",
    address: "House 12, Street 4, Gulshan-e-Iqbal, Block 6",
    city: "Karachi",
  },
  {
    name: "Fatima Khan",
    phone: "+92 321 2345678",
    email: "fatima.khan@example.com",
    address: "Flat 3-B, Askari 11",
    city: "Lahore",
  },
  {
    name: "Bilal Ahmed",
    phone: "+92 333 3456789",
    email: null,
    address: "Office 201, Saudi Pak Tower, Jinnah Avenue",
    city: "Islamabad",
  },
  {
    name: "Ayesha Siddiqui",
    phone: "+92 345 4567890",
    email: "ayesha.s@example.com",
    address: "Home 44, Bahria Town Phase 4, Sector C",
    city: "Rawalpindi",
  },
  {
    name: "Usman Tariq",
    phone: "+92 301 5678901",
    email: "usman.tariq@example.com",
    address: "Peoples Colony No. 1, Street 22",
    city: "Faisalabad",
  },
  {
    name: "Hina Malik",
    phone: "+92 312 6789012",
    email: null,
    address: "Cantt Market, Shop 9, Shah Rukn-e-Alam Road",
    city: "Multan",
  },
  {
    name: "Kamran Shah",
    phone: "+92 334 7890123",
    email: "kamran.shah@example.com",
    address: "University Road, Tehkal Payan",
    city: "Peshawar",
  },
];

type OrderSeed = {
  customerIndex: number;
  daysAgo: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  items: { productSku: string; quantity: number }[];
  notes?: string;
};

const orderSeeds: OrderSeed[] = [
  { customerIndex: 0, daysAgo: 29, status: "DELIVERED", items: [{ productSku: "NPK-SUB-001", quantity: 2 }] },
  { customerIndex: 1, daysAgo: 27, status: "DELIVERED", items: [{ productSku: "NPK-PRT-003", quantity: 1 }, { productSku: "NPK-CRT-007", quantity: 1 }], notes: "[Placeholder] Customer requested evening delivery." },
  { customerIndex: 2, daysAgo: 24, status: "CANCELLED", items: [{ productSku: "NPK-ADA-002", quantity: 3 }] },
  { customerIndex: 0, daysAgo: 21, status: "DELIVERED", items: [{ productSku: "NPK-KID-004", quantity: 2 }, { productSku: "NPK-CA-006", quantity: 1 }] },
  { customerIndex: 3, daysAgo: 18, status: "DELIVERED", items: [{ productSku: "NPK-OMG-005", quantity: 1 }] },
  { customerIndex: 4, daysAgo: 15, status: "SHIPPED", items: [{ productSku: "NPK-SUB-001", quantity: 1 }, { productSku: "NPK-ELE-009", quantity: 2 }] },
  { customerIndex: 5, daysAgo: 12, status: "PROCESSING", items: [{ productSku: "NPK-FE-008", quantity: 4 }] },
  { customerIndex: 6, daysAgo: 9, status: "CONFIRMED", items: [{ productSku: "NPK-CRT-007", quantity: 1 }] },
  { customerIndex: 1, daysAgo: 6, status: "SHIPPED", items: [{ productSku: "NPK-CA-006", quantity: 2 }, { productSku: "NPK-SUB-001", quantity: 1 }] },
  { customerIndex: 3, daysAgo: 4, status: "PROCESSING", items: [{ productSku: "NPK-PRT-003", quantity: 2 }], notes: "[Placeholder] Gift wrap requested." },
  { customerIndex: 2, daysAgo: 2, status: "PENDING", items: [{ productSku: "NPK-ELE-009", quantity: 1 }] },
  { customerIndex: 5, daysAgo: 1, status: "PENDING", items: [{ productSku: "NPK-KID-004", quantity: 1 }, { productSku: "NPK-OMG-005", quantity: 1 }, { productSku: "NPK-ADA-002", quantity: 1 }] },
];

/** COD payment status follows delivery state: collected once delivered. */
function paymentStatusFor(
  status: OrderSeed["status"]
): "PENDING" | "COLLECTED" {
  return status === "DELIVERED" ? "COLLECTED" : "PENDING";
}

async function main() {
  console.log("Seeding Nutripak development database…");

  // ---- Admin ------------------------------------------------------------
  const adminName = process.env.SEED_ADMIN_NAME ?? "Nutripak Admin";
  const adminEmail = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@nutripak.local"
  ).toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: { name: adminName, email: adminEmail, passwordHash },
  });
  console.log(`  Admin ready: ${adminEmail}`);

  // ---- Reset catalog & orders (development seed is idempotent) ----------
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ---- Categories --------------------------------------------------------
  const categoryBySlug = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryBySlug.set(created.slug, created.id);
  }
  console.log(`  ${categories.length} categories created`);

  // ---- Products ----------------------------------------------------------
  const productBySku = new Map<string, { id: string; price: number; name: string }>();
  for (const [index, item] of products.entries()) {
    const categoryId = categoryBySlug.get(item.categorySlug);
    if (!categoryId) throw new Error(`Missing category: ${item.categorySlug}`);

    const created = await prisma.product.create({
      data: {
        name: item.name,
        sku: item.sku,
        slug: item.slug,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        price: item.price,
        stockQuantity: item.stockQuantity,
        ingredients: item.ingredients,
        benefits: item.benefits,
        nutritionInfo: item.nutritionInfo,
        certifications: item.certifications,
        status: "ACTIVE",
        categoryId,
        images: {
          create: item.images.map((url, i) => ({
            url,
            alt: `${item.name} — placeholder image`,
            isMain: i === 0,
            sortOrder: i,
          })),
        },
      },
    });
    void index;
    productBySku.set(created.sku, {
      id: created.id,
      price: Number(created.price),
      name: created.name,
    });
  }
  console.log(`  ${products.length} products created`);

  // ---- Orders (COD only) --------------------------------------------------
  let counter = 1001;
  for (const seed of orderSeeds) {
    const customer = customers[seed.customerIndex];
    const createdAt = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000);

    const items = seed.items.map(({ productSku, quantity }) => {
      const product = productBySku.get(productSku);
      if (!product) throw new Error(`Missing product: ${productSku}`);
      return {
        productId: product.id,
        productName: product.name,
        sku: productSku,
        unitPrice: product.price,
        quantity,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    // Free delivery over Rs 5,000 — mirrors storefront rule planned for phase 2.
    const deliveryCharges = subtotal >= 5000 ? 0 : 200;

    await prisma.order.create({
      data: {
        orderNumber: `NP-${counter++}`,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        address: customer.address,
        city: customer.city,
        notes: seed.notes ?? null,
        subtotal,
        deliveryCharges,
        total: subtotal + deliveryCharges,
        paymentMethod: "COD",
        paymentStatus: paymentStatusFor(seed.status),
        status: seed.status,
        createdAt,
        updatedAt: createdAt,
        items: { create: items },
      },
    });
  }
  console.log(`  ${orderSeeds.length} COD orders created`);
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
