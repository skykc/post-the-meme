// Post the Meme, Win the Feed — entry program (Node 22, standard library only).
// It copies POST.json from the repository root to /output/POST.json, where the
// gate reads it. That is all the program has to do. The entry is the post
// itself: a meme picture about make.fun, posted natively on X from a public
// account with the text the rules ask for, and POST.json names the post.
// Nothing this program writes about the post is scored.
//
// The POST.json shipped here holds a placeholder address, so the gate refuses
// it as it stands (valid 0). Replace it with the real post's address before
// submitting: {"url": "https://x.com/<handle>/status/<id>"}.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

// Fail loudly on a malformed POST.json instead of copying a broken file:
// the gate refuses an entry whose POST.json does not parse.
const postPath = join(BOT_DIR, 'POST.json');
const parsed = JSON.parse(readFileSync(postPath, 'utf8'));
if (typeof parsed !== 'object' || parsed === null || typeof parsed.url !== 'string') {
  console.error('POST.json must be a JSON object with a string "url" field.');
  process.exit(1);
}

// The url must name a real X post: https://x.com/<handle>/status/<id> (or
// twitter.com, www./mobile. prefixes, /i/web/status/<id>). The starter's
// placeholder ("<handle>", "<id>") is refused by the gate on purpose, so
// refuse it here too, with a message that says what to do instead of
// silently handing in an entry that cannot place.
const urlPattern = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(i\/web\/status\/\d+|[A-Za-z0-9_]+\/status\/\d+)([?#].*)?$/;
if (!urlPattern.test(parsed.url)) {
  console.error(
    'POST.json "url" is not a real X post address. Post the meme on X, then ' +
      'put its address in POST.json as {"url": "https://x.com/<handle>/status/<id>"}.',
  );
  process.exit(1);
}

try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
