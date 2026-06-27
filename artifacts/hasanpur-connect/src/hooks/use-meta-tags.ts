import { useEffect } from 'react';

interface MetaTags {
  title: string;
  description?: string;
  ogImage?: string;
}

export function useMetaTags({ title, description, ogImage }: MetaTags) {
  useEffect(() => {
    document.title = `${title} | Hasanpur Connect`;

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    if (ogImage) {
      let metaOgImage = document.querySelector('meta[property="og:image"]');
      if (!metaOgImage) {
        metaOgImage = document.createElement('meta');
        metaOgImage.setAttribute('property', 'og:image');
        document.head.appendChild(metaOgImage);
      }
      metaOgImage.setAttribute('content', ogImage);
    }
  }, [title, description, ogImage]);
}
