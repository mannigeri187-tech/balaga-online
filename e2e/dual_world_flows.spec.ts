import { test, expect } from "@playwright/test";

test.describe("Balaga.online Dual-World E2E Test Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("1. Root shell loads correctly with World Switcher and PWA metadata", async ({ page }) => {
    await expect(page).toHaveTitle(/Balaga/i);

    // Verify World Switcher exists
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    await expect(switcherBtn).toBeVisible();

    // Verify Brand Name in header
    await expect(page.locator("header")).toContainText(/Balaga/i);
  });

  test("2. Founders Realm: Innovations Bar displays and launches builder tools", async ({ page }) => {
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    const currentWorldText = await switcherBtn.textContent();

    // Ensure we are in Founders realm
    if (!currentWorldText?.includes("Founders")) {
      await switcherBtn.click();
      await page.locator("button:has-text('Founders')").click();
      await page.waitForTimeout(500);
    }

    // Verify Founders realm indicator
    await expect(switcherBtn).toContainText(/Founders/i);

    // Verify Founders showcase bar has innovations
    await expect(page.locator("text=New Founders Innovations (Live)")).toBeVisible();

    // Verify specific founder feature buttons exist
    await expect(page.locator("button:has-text('Blueprints ⚡')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Code Cast 🖥️')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Squads 🏆')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Subdomains 🌐')").first()).toBeVisible();

    // Open Hackathon Squad Matchmaker Modal
    await page.locator("button:has-text('Squads 🏆')").first().click();
    await expect(page.locator("h2:has-text('Hackathon Squad Matchmaker')")).toBeVisible();

    // Close the modal
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn.click();
    await expect(page.locator("h2:has-text('Hackathon Squad Matchmaker')")).not.toBeVisible();
  });

  test("3. World Switching: Flips state cleanly to Socializing with zero bleed", async ({ page }) => {
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    await switcherBtn.click();

    // Select Socializing World
    const socialOpt = page.locator("button:has-text('Socializing')").first();
    await expect(socialOpt).toBeVisible();
    await socialOpt.click();

    // Verify Switcher reflects Socializing
    await expect(switcherBtn).toContainText(/Socializing/i);

    // Verify Social Innovations Hub is visible
    await expect(page.locator("text=Social Innovations Hub")).toBeVisible();

    // Verify Founders Hub is NOT visible
    await expect(page.locator("text=New Founders Innovations (Live)")).not.toBeVisible();

    // Verify Socializing features exist
    await expect(page.locator("button:has-text('Micro-Apps 💻')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Prediction Stakes 📈')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Social Twin 🤖')").first()).toBeVisible();
  });

  test("4. Socializing Realm: Interactive modals operate smoothly", async ({ page }) => {
    // Ensure in Socializing
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    const currentWorldText = await switcherBtn.textContent();
    if (!currentWorldText?.includes("Socializing")) {
      await switcherBtn.click();
      await page.locator("button:has-text('Socializing')").first().click();
      await page.waitForTimeout(500);
    }

    // Open Living Micro-Apps modal
    const microAppsBtn = page.locator("button:has-text('Micro-Apps 💻')").first();
    await expect(microAppsBtn).toBeVisible();
    await microAppsBtn.click();

    // Verify modal is open
    await expect(page.locator("h2:has-text('Living Micro-Apps Container')")).toBeVisible();

    // Close modal
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn.click();
    await expect(page.locator("h2:has-text('Living Micro-Apps Container')")).not.toBeVisible();
  });

  test("5. Command Palette: Shortcut pill opens palette and filters commands", async ({ page }) => {
    // Click floating command palette trigger pill in bottom-left
    const palettePill = page.locator("button:has-text('Command Menu')").first();
    await expect(palettePill).toBeVisible();
    await palettePill.click();

    // Verify palette search input is focused/visible
    const searchInput = page.locator("input[placeholder*='Type a command']");
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill("Hackathon");
    await expect(page.locator("div:has-text('Hackathon Squad Matchmaker')").first()).toBeVisible();

    // Close palette using Escape
    await page.keyboard.press("Escape");
    await expect(searchInput).not.toBeVisible();
  });

  test("6. Balaga Intelligence: Floating AI pill opens Control Centre with Zero-Leakage Shield", async ({ page }) => {
    // Click floating Balaga AI trigger pill in bottom-left
    const aiPill = page.locator("button:has-text('Balaga AI')").first();
    await expect(aiPill).toBeVisible();
    await aiPill.click();

    // Verify modal title & Zero-Leakage shield badge
    await expect(page.locator("h2:has-text('Balaga Intelligence')")).toBeVisible();
    await expect(page.locator("text=Zero-Leakage Shield Active")).toBeVisible();

    // Click Privacy & Consent Controls tab
    await page.locator("button:has-text('Privacy & Consent Controls')").click();
    await expect(page.locator("text=Privacy-First Intelligence Agreement")).toBeVisible();

    // Close modal
    const closeBtn = page.locator("button:has-text('Close')").last();
    await closeBtn.click();
    await expect(page.locator("h2:has-text('Balaga Intelligence')")).not.toBeVisible();
  });

  test("7. Milestone 2: Socializing AI Caption and Digest triggers operate smoothly", async ({ page }) => {
    // Ensure in Socializing
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    const currentWorldText = await switcherBtn.textContent();
    if (!currentWorldText?.includes("Socializing")) {
      await switcherBtn.click();
      await page.locator("button:has-text('Socializing')").first().click();
      await page.waitForTimeout(500);
    }

    // Verify AI Digest button in Innovations bar
    const aiDigestBtn = page.locator("button:has-text('AI Digest 📢')").first();
    await expect(aiDigestBtn).toBeVisible();
    await aiDigestBtn.click();

    // Verify Intelligence modal opens with Community Digest active
    await expect(page.locator("h2:has-text('Balaga Intelligence')")).toBeVisible();
    await expect(page.locator("button:has-text('Community Digest 📢')")).toBeVisible();

    // Close modal
    await page.locator("button:has-text('Close')").last().click();
    await expect(page.locator("h2:has-text('Balaga Intelligence')")).not.toBeVisible();

    // Verify AI Caption button in post composer
    const aiCaptionBtn = page.locator("button:has-text('AI Caption ✨')").first();
    await expect(aiCaptionBtn).toBeVisible();
  });

  test("8. Milestone 4, 5, 7: Dual-Realm Intelligence operates with realm-specific tasks", async ({ page }) => {
    // Switch to Founders realm
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    await switcherBtn.click();
    await page.locator("button:has-text('Founders')").first().click();
    await page.waitForTimeout(500);

    // Click Founder AI button in innovations showcase bar
    const founderAiBtn = page.locator("button:has-text('Founder AI ✨')").first();
    await expect(founderAiBtn).toBeVisible();
    await founderAiBtn.click();

    // Verify Founders realm intelligence modal opens
    await expect(page.locator("h2:has-text('Balaga Intelligence')")).toBeVisible();
    await expect(page.locator("button:has-text('Traction Pulse 🚀')")).toBeVisible();
    await expect(page.locator("button:has-text('Market & Competitor Intel 📊')")).toBeVisible();
    await expect(page.locator("button:has-text('Build Space Task Breakdown 🔨')")).toBeVisible();

    // Close modal
    await page.locator("button:has-text('Close')").last().click();
    await expect(page.locator("h2:has-text('Balaga Intelligence')")).not.toBeVisible();
  });

  test("9. Socializing Navigation: All sidebar tabs switch views seamlessly", async ({ page }) => {
    // Ensure in Socializing realm
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    const currentWorldText = await switcherBtn.textContent();
    if (!currentWorldText?.includes("Socializing")) {
      await switcherBtn.click();
      await page.locator("button:has-text('Socializing')").first().click();
      await page.waitForTimeout(500);
    }

    // 1. Search & Explore
    await page.locator("aside button:has-text('Search & Explore')").click();
    await expect(page.locator("input[placeholder*='Search accounts, reels']")).toBeVisible();

    // 2. Reels
    await page.locator("aside button:has-text('Reels')").click();
    await expect(page.locator("h2:has-text('Reels & Short Videos')")).toBeVisible();

    // 3. Communities
    await page.locator("aside button:has-text('Communities')").click();
    await expect(page.locator("button:has-text('Start a Circle')").first()).toBeVisible();

    // 4. Events
    await page.locator("aside button:has-text('Events')").click();
    await expect(page.locator("button:has-text('Organize Event')").first()).toBeVisible();

    // 5. Messages
    await page.locator("aside button:has-text('Messages')").click();
    await expect(page.locator("input[placeholder*='Search conversations']")).toBeVisible();

    // 6. Notifications
    await page.locator("aside button:has-text('Notifications')").click();
    await expect(page.locator("h2:has-text('Notifications')")).toBeVisible();

    // 7. Profile
    await page.locator("aside button:has-text('Profile')").click();
    await expect(page.locator("button:has-text('Edit Profile')").first()).toBeVisible();

    // 8. Return Home (Feed)
    await page.locator("aside button:has-text('Home')").click();
    await expect(page.locator("text=Social Innovations Hub")).toBeVisible();
  });

  test("10. Public Landing Page & Zero-Fee UPI Payment: Opens landing page, triggers Login & UPI modal cleanly", async ({ page }) => {
    // Open Landing Page from header
    const landingBtn = page.locator("header button:has-text('Landing Page')");
    await expect(landingBtn).toBeVisible();
    await landingBtn.click();

    // Verify Landing Page hero
    await expect(page.locator("text=One Platform.")).toBeVisible();
    await expect(page.locator("text=India's Premier Dual-Realm Network")).toBeVisible();

    // Open UPI Payment Modal from Landing Page navbar
    const upiBtn = page.locator("nav button:has-text('UPI Payment')");
    await upiBtn.click();

    // Verify UPI Payment Modal
    await expect(page.locator("text=Zero-Fee UPI Gateway")).toBeVisible();
    await expect(page.locator("text=0% MDR")).toBeVisible();
    await expect(page.locator("text=balaga@okhdfcbank")).toBeVisible();

    // Simulate instant test payment
    const simulateBtn = page.locator("button:has-text('Simulate Instant UPI Payment')");
    await simulateBtn.click();

    // Verify Payment Confirmation
    await expect(page.locator("text=Payment Confirmed!")).toBeVisible();
    await expect(page.locator("text=Continue to Realm")).toBeVisible();

    // Close / Continue to Realm
    await page.locator("button:has-text('Continue to Realm')").click();
    await expect(page.locator("text=Payment Confirmed!")).not.toBeVisible();
  });
});



