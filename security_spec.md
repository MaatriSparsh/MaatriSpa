# Firestore Security Specification - MaatriSparsh

This document defines the zero-trust security specification for MaatriSparsh's Firestore Collections under the Attribute-Based Access Control (ABAC) design patterns.

## 1. Data Invariants

1. **User Ownership & Isolation**: A user's profile (`users/{userId}`) is strictly private. Only the authenticated user whose `uid` matches the `userId` may read or write/update this document. Email verification is mandatory (`request.auth.token.email_verified == true`).
2. **Booking Ownership**: Bookings (`bookings/{bookingId}`) must have a `userId` field matching the currently logged-in authenticated user's `uid`.
3. **Immutability of Keys**: Critical tracking keys (such as `createdAt` and `userId` inside a booking) must be immutable and verified with the current server time (`request.time`).
4. **Strict Schema Constraints**: No write or update is permitted without validating every schema key and matching exact data types (the "Anti-Update-Gap" validation helper).
5. **No Blind Escalation**: Users cannot modify their status or self-assign attributes without validation rules rejecting incorrect actions.

---

## 2. The "Dirty Dozen" (12 Vulnerability Payloads)

Here are 12 rogue JSON payloads designed to violate identity representation, boundary validation, and security invariants. Each payload must return `PERMISSION_DENIED`:

### Collection: `users`

1. **Spoofed User Registration (Identity Spoofing)**
   * *Payload*: `users/user_alice` with write data where `uid` is set to `"user_bob"` by a client logged in as alice.
   * *Vulnerability Checked*: Forges user identity profile, overriding other profiles.
2. **Email Verification Bypass (Verification Spoofing)**
   * *Payload*: Creates user profile from account where `email_verified == false`.
   * *Vulnerability Checked*: Overriding verification gating.
3. **Ghost Fields Injection (Shadow Update)**
   * *Payload*: `users/user_alice` with data containing `isAdmin: true` or `role: "admin"`.
   * *Vulnerability Checked*: Modifies role keys to gain unauthorized escalations.
4. **Time Deception (Temporal Tampering)**
   * *Payload*: Sets `createdAt` to a historical or future millisecond rather than `request.time`.
   * *Vulnerability Checked*: Invalidate creation audit timestamps.

### Collection: `bookings`

5. **Cross-User Booking Theft (Unsigned Resource Access)**
   * *Payload*: `bookings/booking_123` with `userId` of `"user_bob"` written by authenticated client `"user_alice"`.
   * *Vulnerability Checked*: Setting other users' bookings.
6. **Denial of Wallet String Poisoning (Resource Exhaustion)**
   * *Payload*: `bookings/booking_123` with a notes field comprising 1.2MB of junk characters.
   * *Vulnerability Checked*: Storing excessive junk strings, bloating database cost.
7. **Negative Charge Trick (Value Poisoning)**
   * *Payload*: Set `servicePrice` inside booking to `-500` or an invalid type like `[500]`.
   * *Vulnerability Checked*: Negating price fields or bypassing types.
8. **Invalid Format Path Injection (ID Poisoning ID)**
   * *Payload*: Document ID named `../injected/path/override` to exploit directory traversal.
   * *Vulnerability Checked*: Spoofing Firestore paths via unsafe path variables.
9. **Status Self-Escalation (State Shortcutting)**
   * *Payload*: Change booking update to modify `status` directly to `'cancelled'` without using the specific `cancel` update affectedKeys branch.
   * *Vulnerability Checked*: Modifying fields beyond the permitted action-gating.
10. **Terminated Session Overwrite (Terminal State Locking)**
    * *Payload*: Overwriting an existing finalized booking where `status == 'cancelled'`.
    * *Vulnerability Checked*: Retrospective tampering of closed/past transactions.
11. **Immutability Breach (Key Overwrite)**
    * *Payload*: Update booking changing the `userId` to a target victim's UID.
    * *Vulnerability Checked*: Switching ownership of existing scheduled appointments.
12. **Blanket Query Scraping (Insecure List Query)**
    * *Query*: Requesting all bookings without an evaluation limit or matching a secure relational owner where clause: `where("userId", "==", currentUid)`.
    * *Vulnerability Checked*: Data scraping of other users' postpartum records.

---

## 3. The Test Runner Spec

The testing module (`firestore.rules.test.ts`) simulates the "Dirty Dozen" scenarios against the local firebase rules.

*(Implementation is targeted via local unit validation and Red Team self-reflection)*
