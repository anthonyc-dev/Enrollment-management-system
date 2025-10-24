import "@testing-library/jest-dom";

// 👇 Fix for "TextEncoder is not defined" (Node environment)
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
