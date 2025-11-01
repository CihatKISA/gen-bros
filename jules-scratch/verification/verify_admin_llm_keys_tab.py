from playwright.sync_api import sync_playwright, Page, expect

def run(page: Page):
    # Go to admin panel to create a new user
    page.goto("http://localhost:3000/admin")

    # Check if a user already exists
    try:
        page.get_by_label("Email").fill("admin@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
    except:
        # If login fails, create a new user
        page.get_by_role("link", name="Sign up").click()
        page.get_by_label("Email").fill("admin@example.com")
        page.get_by_label("Password").fill("password")
        page.get_by_label("Confirm Password").fill("password")
        page.get_by_role("button", name="Sign up").click()
        page.wait_for_url("http://localhost:3000/admin")

    # Go to dashboard
    page.goto("http://localhost:3000/dashboard")

    # Verify that the "LLM Keys" tab is visible
    llm_keys_tab = page.get_by_role("tab", name="LLM Keys")
    expect(llm_keys_tab).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        run(page)
        browser.close()

if __name__ == "__main__":
    main()
