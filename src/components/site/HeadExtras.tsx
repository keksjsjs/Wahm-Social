import type { HeadSettings } from "@/lib/site/types";

/** JSON for embedding inside an inline <script> without closing it early. */
const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, " ");

/**
 * Google Analytics (gtag) by measurement id + optional admin HTML for <head>.
 * The custom HTML is appended by a tiny inline script so <script> tags inside it run.
 */
export function HeadExtras({ head }: { head: HeadSettings }) {
  const ga = /^(G|UA|GT|AW)-[A-Z0-9-]{4,30}$/.test(head.gaId) ? head.gaId : "";
  const custom = head.customHead?.trim();
  return (
    <>
      {ga && <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} />}
      {ga && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${safeJson(ga)});`,
          }}
        />
      )}
      {custom && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=document.createElement('template');t.innerHTML=${safeJson(custom)};Array.prototype.slice.call(t.content.childNodes).forEach(function(n){if(n.nodeName==='SCRIPT'){var s=document.createElement('script');for(var i=0;i<n.attributes.length;i++)s.setAttribute(n.attributes[i].name,n.attributes[i].value);s.text=n.textContent||'';document.head.appendChild(s)}else if(n.nodeType===1){document.head.appendChild(n)}})}catch(e){}})();`,
          }}
        />
      )}
    </>
  );
}
