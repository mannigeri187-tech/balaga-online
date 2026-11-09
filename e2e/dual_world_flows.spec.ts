import { test, expect } from "@playwright/test";

test.describe("Balaga.online E2E Test Suite — Landing Page & Dual-Realm Platform", () => {
  // ── 1. ROOT LANDING PAGE TESTS ──
  test("1. Root URL / displays the Public Landing Page by default with Butterflow aesthetic", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveTitle(/Balaga/i);

    // Verify monumental hero typography
    await expect(page.locator("text=Two Worlds.")).toBeVisible();
    await expect(page.locator("text=One Identity.")).toBeVisible();
    await expect(page.locator("text=Infinite Possibilities.")).toBeVisible();

    // Verify key navigation actions on landing page
    await expect(page.locator("nav button:has-text('Join Balaga')")).toBeVisible();
    await expect(page.locator("nav button:has-text('Log In')")).toBeVisible();
    await expect(page.locator("nav button:has-text('Zero-Fee UPI')")).toBeVisible();

    // Verify architectural badge
    await expect(page.locator("text=Sovereign Dual-Realm Architecture")).toBeVisible();
  });

  test("2. Landing Page: Opens Login and Join Balaga modal with 1-click profiles", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Click "Join Balaga"
    const joinBtn = page.locator("nav button:has-text('Join Balaga')");
    await joinBtn.click();

    // Verify Signup / Registration modal appears
    await expect(page.locator("text=Create Your Balaga Account")).toBeVisible();
    await expect(page.locator("text=Instant 1-Click Demo Profiles")).toBeVisible();

    // Close modal
    await page.locator("button:has(svg.lucide-x)").first().click();
    await expect(page.locator("text=Create Your Balaga Account")).not.toBeVisible();

    // Click "Log In"
    await page.locator("nav button:has-text('Log In')").click();
    await expect(page.locator("text=Welcome to Balaga")).toBeVisible();
  });

  test("3. Landing Page: Zero-Fee UPI Payment Gateway opens and simulates settlement", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open UPI Payment Modal from Landing Page navbar
    const upiBtn = page.locator("nav button:has-text('Zero-Fee UPI')");
    await upiBtn.click();

    // Verify UPI Payment Modal details
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

  // ── 2. IN-APP DUAL REALM TESTS ──
  test("4. Navigation to App: Launches authenticated application seamlessly", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

    // Verify World Switcher exists in Header
    const switcherBtn = page.locator("button[aria-haspopup='true']");
    await expect(switcherBtn).toBeVisible();

    // Verify Brand Name in header
    await expect(page.locator("header")).toContainText(/Balaga/i);

    // Verify "Landing Page" return button in header
    await expect(page.locator("header button:has-text('Landing Page')")).toBeVisible();
  });

  test("5. Founders Realm: Innovations Bar displays and launches builder tools", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

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

  test("6. World Switching: Flips state cleanly to Socializing with zero bleed", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

    const switcherBtn = page.locator("button[aria-haspopup='true']");
    await switcherBtn.click();

    // Select Socializing World
    const socialOpt = page.locator("button:has-text('Socializing')").first();
    await expect(socialOpt).toBeVisible();
    await socialOpt.click();
    await page.waitForTimeout(500);

    // Verify Switcher updated
    await expect(switcherBtn).toContainText(/Socializing/i);

    // Verify Social Innovations Hub is visible
    await expect(page.locator("text=Social Innovations Hub (Live)")).toBeVisible();
  });

  test("7. Socializing Realm: Interactive modals operate smoothly", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

    const switcherBtn = page.locator("button[aria-haspopup='true']");
    if (!(await switcherBtn.textContent())?.includes("Socializing")) {
      await switcherBtn.click();
      await page.locator("button:has-text('Socializing')").first().click();
      await page.waitForTimeout(500);
    }

    // Click "Flash Hangouts ⚡"
    await page.locator("button:has-text('Flash Hangouts ⚡')").first().click();
    await expect(page.locator("h2:has-text('Real-Time Flash Hangouts')")).toBeVisible();

    // Close the modal
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn.click();
    await expect(page.locator("h2:has-text('Real-Time Flash Hangouts')")).not.toBeVisible();
  });

  test("8. Command Palette: Shortcut pill opens palette and filters commands", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

    // Click the bottom floating command palette trigger
    const cmdTrigger = page.locator("button:has-text('⌘K Command Menu')");
    await expect(cmdTrigger).toBeVisible();
    await cmdTrigger.click();

    // Verify Command Palette is visible
    await expect(page.locator("input[placeholder*='Type a command']")).toBeVisible();

    // Type "Landing" to filter command
    await page.locator("input[placeholder*='Type a command']").fill("Landing");
    await expect(page.locator("text=View Public Landing Page")).toBeVisible();

    // Close palette with ESC
    await page.keyboard.press("Escape");
    await expect(page.locator("input[placeholder*='Type a command']")).not.toBeVisible();
  });

  test("9. Balaga Intelligence: Floating AI pill opens Control Centre with Zero-Leakage Shield", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

    // Click the bottom floating AI pill
    const aiTrigger = page.locator("button:has-text('✨ Balaga AI')");
    await expect(aiTrigger).toBeVisible();
    await aiTrigger.click();

    // Verify Intelligence Modal opened
    await expect(page.locator("h2:has-text('Balaga Intelligence Control Centre')")).toBeVisible();
    await expect(page.locator("text=Zero-Leakage Shield Active")).toBeVisible();

    // Close modal
    const closeBtn = page.locator("button:has(svg.lucide-x)").first();
    await closeBtn.click();
    await expect(page.locator("h2:has-text('Balaga Intelligence Control Centre')")).not.toBeVisible();
  });

  test("10. Socializing Navigation: All sidebar tabs switch views seamlessly", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("domcontentloaded");

    const switcherBtn = page.locator("button[aria-haspopup='true']");
    if (!(await switcherBtn.textContent())?.includes("Socializing")) {
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

    // 4. Return Home (Feed)
    await page.locator("aside button:has-text('Home')").click();
    await expect(page.locator("text=Social Innovations Hub")).toBeVisible();
  });
});
