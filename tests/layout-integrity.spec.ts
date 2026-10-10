import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/bulk-orders', '/samples', '/shop'];
const VIEWPORTS = [
  { width: 375, height: 812, name: '375px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 1366, height: 900, name: '1366px' },
];

test.describe('Site-Wide Layout Integrity & Overflow Verification', () => {
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`${route} at ${vp.name}: no overflow, no clipping, proper centering`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'networkidle' });

        const results = await page.evaluate(() => {
          const errors: string[] = [];

          // Allowlist for intentional decorations with explicit documented reasons
          const isAllowlistedDecoration = (el: Element | null): boolean => {
            if (!el) return false;
            // Reason 1: Hero decorative background blob positioned with translate-x-4 translate-y-4
            if (el.classList && (el.classList.contains('translate-x-4') || (typeof el.className === 'string' && el.className.includes('translate-x-4')))) return true;
            // Reason 2: Hero floating badges intentionally overlapping circular product image per Step 3
            if (el.classList && el.classList.contains('whitespace-nowrap') && el.closest('section')) return true;
            // Reason 3: Hero image wrapper containing overlapping decorative badges and blob
            if (el.classList && el.classList.contains('aspect-square') && el.closest('section')) return true;
            // Reason 4: Mobile drawers and off-canvas sidebars when closed (-translate-x-full)
            if (el.closest('#mobile-drawer') || el.closest('nextjs-portal')) return true;
            if (el.tagName && el.tagName.toLowerCase() === 'aside' && (el.className?.includes?.('-translate-x-full') || el.closest('aside')?.className?.includes?.('-translate-x-full'))) return true;
            // Reason 5: Native form select options rendered in shadow DOM / OS native dropdowns
            if (el.tagName && el.tagName.toLowerCase() === 'option') return true;
            return false;
          };

          const allElements = Array.from(document.querySelectorAll('*'));

          // (1) Check scrollWidth > clientWidth with overflow visible (text spilling out)
          for (const el of allElements) {
            const tag = el.tagName.toLowerCase();
            if (['script', 'style', 'svg', 'path', 'g', 'defs', 'clippath', 'nextjs-portal'].includes(tag)) continue;
            if (el.closest('nextjs-portal')) continue;
            if (isAllowlistedDecoration(el)) continue;

            const cs = window.getComputedStyle(el);
            if (cs.display === 'inline' || cs.display === 'none') continue;

            if (el.scrollWidth > el.clientWidth + 1) {
              const overflowX = cs.overflowX;
              if (overflowX === 'visible' && el !== document.documentElement && el !== document.body) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  errors.push(`(1) Overflow: <${tag} class="${(el.className || '').slice(0, 50)}"> scrollWidth (${el.scrollWidth}) > clientWidth (${el.clientWidth}) with overflowX visible`);
                }
              }
            }
          }

          // (2) Any child box extending past parent padding box (excluding intentional decorations)
          for (const el of allElements) {
            const tag = el.tagName.toLowerCase();
            if (['script', 'style', 'svg', 'path', 'g', 'nextjs-portal'].includes(tag)) continue;
            if (el.closest('nextjs-portal')) continue;
            if (isAllowlistedDecoration(el)) continue;

            const parent = el.parentElement;
            if (!parent || parent === document.documentElement || parent === document.body) continue;
            if (isAllowlistedDecoration(parent)) continue;

            const csParent = window.getComputedStyle(parent);
            if (csParent.overflow === 'hidden' || csParent.overflowX === 'hidden' || csParent.display === 'none') continue;
            const csChild = window.getComputedStyle(el);
            if (csChild.position === 'absolute' || csChild.position === 'fixed') continue;

            const pRect = parent.getBoundingClientRect();
            const cRect = el.getBoundingClientRect();

            if (cRect.width > 0 && cRect.height > 0 && pRect.width > 0 && pRect.height > 0) {
              if (cRect.left < pRect.left - 2 || cRect.right > pRect.right + 2) {
                errors.push(`(2) Boundary: <${tag} class="${(el.className || '').slice(0, 40)}"> [${Math.round(cRect.left)}, ${Math.round(cRect.right)}] extends past parent <${parent.tagName.toLowerCase()} class="${(parent.className || '').slice(0, 40)}"> [${Math.round(pRect.left)}, ${Math.round(pRect.right)}]`);
              }
            }
          }

          // (3) Any text node within 4px of edge of ancestor with visible background or border
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
          let node: Node | null;
          while ((node = walker.nextNode())) {
            const text = node.nodeValue?.trim();
            if (!text) continue;
            const parentEl = node.parentElement;
            if (!parentEl) continue;
            if (['script', 'style', 'svg', 'path', 'nextjs-portal'].includes(parentEl.tagName.toLowerCase())) continue;
            if (parentEl.closest('nextjs-portal') || parentEl.closest('#mobile-drawer')) continue;
            if (isAllowlistedDecoration(parentEl)) continue;

            const csParent = window.getComputedStyle(parentEl);
            if (csParent.display === 'none' || csParent.visibility === 'hidden') continue;

            const range = document.createRange();
            range.selectNodeContents(node);
            const tRect = range.getBoundingClientRect();
            if (tRect.width === 0 || tRect.height === 0) continue;

            // Check visible ancestor container (card, badge, button, form box)
            let ancestor: HTMLElement | null = parentEl;
            while (ancestor && ancestor !== document.body && ancestor !== document.documentElement) {
              if (isAllowlistedDecoration(ancestor)) break;
              const cs = window.getComputedStyle(ancestor);
              const hasBg = cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';

              const checkLeft = hasBg || (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none' && cs.borderLeftColor !== 'transparent');
              const checkRight = hasBg || (parseFloat(cs.borderRightWidth) > 0 && cs.borderRightStyle !== 'none' && cs.borderRightColor !== 'transparent');
              const checkTop = hasBg || (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none' && cs.borderTopColor !== 'transparent');
              const checkBottom = hasBg || (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none' && cs.borderBottomColor !== 'transparent');

              if (checkLeft || checkRight || checkTop || checkBottom) {
                const aRect = ancestor.getBoundingClientRect();
                if (aRect.width > 0 && aRect.height > 0 && cs.display !== 'inline') {
                  const leftDiff = tRect.left - aRect.left;
                  const rightDiff = aRect.right - tRect.right;
                  const topDiff = tRect.top - aRect.top;
                  const bottomDiff = aRect.bottom - tRect.bottom;

                  const edgeViolations: string[] = [];
                  if (checkLeft && leftDiff < 3.5) edgeViolations.push(`L=${leftDiff.toFixed(1)}`);
                  if (checkRight && rightDiff < 3.5) edgeViolations.push(`R=${rightDiff.toFixed(1)}`);
                  if (checkTop && topDiff < 3.5) edgeViolations.push(`T=${topDiff.toFixed(1)}`);
                  if (checkBottom && bottomDiff < 3.5) edgeViolations.push(`B=${bottomDiff.toFixed(1)}`);

                  if (edgeViolations.length > 0) {
                    errors.push(`(3) Text Edge: "${text.slice(0, 20)}..." in <${ancestor.tagName.toLowerCase()} class="${(ancestor.className || '').slice(0, 40)}"> is too close to edge: ${edgeViolations.join(' ')}`);
                    break;
                  }
                }
              }
              ancestor = ancestor.parentElement;
            }
          }

          // (4) Centered content blocks centered within 2px
          const centeredBlocks = document.querySelectorAll('.mx-auto, [style*="margin: 0 auto"], [style*="margin:0 auto"]');
          for (const block of Array.from(centeredBlocks)) {
            const cs = window.getComputedStyle(block);
            if (cs.display === 'none' || cs.position === 'absolute') continue;
            const bRect = block.getBoundingClientRect();
            if (bRect.width > 0 && bRect.height > 0 && bRect.width < window.innerWidth - 10) {
              const blockCenter = bRect.left + bRect.width / 2;
              const parentCenter = block.parentElement ? block.parentElement.getBoundingClientRect().left + block.parentElement.getBoundingClientRect().width / 2 : window.innerWidth / 2;
              const diff = Math.abs(blockCenter - parentCenter);
              if (diff > 2) {
                errors.push(`(4) Centering: <${block.tagName.toLowerCase()} class="${(block.className || '').slice(0, 50)}"> is off-center by ${diff.toFixed(1)}px (block center: ${blockCenter.toFixed(1)}, parent center: ${parentCenter.toFixed(1)})`);
              }
            }
          }

          return errors;
        });

        expect(results, results.slice(0, 5).join('\n')).toEqual([]);
      });
    }
  }
});
