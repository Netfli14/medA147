import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
}

export function SEOHead({ title, description, path = "/", type = "website" }: SEOHeadProps) {
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${path}`;
  const fullTitle = `${title} | MedAI+`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", fullUrl, "property");
    setMeta("og:type", type, "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    // JSON-LD
    let script = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebSite",
      name: fullTitle,
      description,
      url: fullUrl,
    });

    return () => {
      script?.remove();
    };
  }, [fullTitle, description, fullUrl, type]);

  return null;
}
