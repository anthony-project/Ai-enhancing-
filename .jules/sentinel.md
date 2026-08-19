## 2025-05-18 - Base64 Data URI Validation Bypasses via Length Short-Circuits
**Vulnerability:** `isValidBase64Image` previously used a length check (`|| data.length > 50`) to avoid ReDoS performance issues on large base64 image strings. This allowed any string starting with `data:image/` over 50 characters to bypass format and MIME validation.
**Learning:** Short-circuiting input validation based on string length to improve performance opens bypass vectors for malformed or malicious payloads.
**Prevention:** Verify the exact Data URI prefix (`data:image/(png|jpeg|jpg|webp|gif|bmp);base64,`) and perform character-set validation on a fixed-length sample chunk (e.g. initial 4096 bytes) rather than bypassing checks altogether.
