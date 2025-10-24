import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // for toBeInTheDocument()
import EnrollmentLogin from "../src/pages/enrollmentSide/EnrollmentLogin";

describe("Enrollment Login Page", () => {
  it("should log in successfully when credentials are correct", async () => {
    render(<EnrollmentLogin />);

    // Fill in email and password fields
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "admin@admin.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "12345" },
    });

    // Click the login button
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Wait for UI to update (e.g., redirect or message)
    await waitFor(() =>
      expect(screen.getByText(/welcome/i)).toBeInTheDocument()
    );
  });
});
