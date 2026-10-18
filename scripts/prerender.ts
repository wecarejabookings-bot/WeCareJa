import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AppLandingCover } from '../src/components/cover/AppLandingCover';
import { INITIAL_SERVICES, INITIAL_NURSES } from '../src/data/mockData';

async function prerender() {
  console.log('[SSG Prerender] Starting pre-render generation for WeCare Jamaica...');
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('[SSG Prerender] dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');

  // Render AppLandingCover to static HTML
  const landingMarkup = renderToString(
    React.createElement(AppLandingCover, {
      services: INITIAL_SERVICES,
      nurses: INITIAL_NURSES,
      logoVariation: 'heart-cross',
      onOpenSignIn: () => {},
      onOpenRegisterClient: () => {},
      onOpenRegisterNurse: () => {},
      onOpenLaunchKit: () => {},
      onOpenPanic: () => {},
    })
  );

  console.log(`[SSG Prerender] Rendered landing page markup (${landingMarkup.length} chars)`);

  // Target routes to pre-render with customized meta tags
  const routes = [
    {
      route: '/',
      outFile: path.join(distDir, 'index.html'),
      title: 'WeCare Jamaica - Home Care Nurses & Caregivers | Kingston, St. Andrew & Portmore',
      description: 'Verified, NCJ-licensed Jamaican nurses & caregivers delivered to your door in Kingston, St. Andrew, Portmore & Spanish Town. 15–30 min response time, sterile wound dressings, elderly care & escrow-protected payments.',
      url: 'https://wecareja.com/',
      markup: landingMarkup,
    },
    {
      route: '/store',
      outFile: path.join(distDir, 'store', 'index.html'),
      title: 'WeCare Medical Store Jamaica - Doorstep Delivery for Equipment & Supplies',
      description: 'Order digital blood pressure monitors, pulse oximeters, wheelchairs, commodes, wound kits & adult diapers with same-day delivery in Kingston & St. Catherine.',
      url: 'https://wecareja.com/store',
      markup: landingMarkup,
    },
    {
      route: '/nurse-signup',
      outFile: path.join(distDir, 'nurse-signup', 'index.html'),
      title: 'Join WeCare Jamaica as a Registered Nurse or Caregiver (Top Earnings)',
      description: 'Earn up to 85% per visit with guaranteed bank deposits to NCB, Scotiabank, JN Bank & Sagicor. NCJ-licensed nurses and experienced caregivers welcome.',
      url: 'https://wecareja.com/nurse-signup',
      markup: landingMarkup,
    },
    {
      route: '/about',
      outFile: path.join(distDir, 'about', 'index.html'),
      title: 'About WeCare Jamaica - Verified In-Home Clinical Healthcare Network',
      description: 'Learn about WeCare Jamaica, connecting certified Jamaican nurses with families needing wound care, diabetes management, and elder care across Kingston & Portmore.',
      url: 'https://wecareja.com/about',
      markup: landingMarkup,
    },
    {
      route: '/contact',
      outFile: path.join(distDir, 'contact', 'index.html'),
      title: 'Contact WeCare Jamaica - 24/7 Clinical Support & 119 Emergency SOS',
      description: 'Call (876) 582-7613 for rapid nurse dispatch or emergency advice in Kingston, St. Andrew, Portmore, and Spanish Town.',
      url: 'https://wecareja.com/contact',
      markup: landingMarkup,
    },
    {
      route: '/terms',
      outFile: path.join(distDir, 'terms', 'index.html'),
      title: 'Terms of Care & Privacy Notice - WeCare Jamaica',
      description: 'Review our Data Protection Act (DPA 2020) compliance, clinical protocols, and escrow payment safety protections.',
      url: 'https://wecareja.com/terms',
      markup: landingMarkup,
    },
  ];

  for (const page of routes) {
    const dir = path.dirname(page.outFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let pageHtml = template;

    // Replace title
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`);
    
    // Replace meta description & og:description
    pageHtml = pageHtml.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
      `<meta name="description" content="${page.description}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/,
      `<meta property="og:title" content="${page.title}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/,
      `<meta property="og:description" content="${page.description}" />`
    );
    pageHtml = pageHtml.replace(
      /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/,
      `<meta property="og:url" content="${page.url}" />`
    );
    pageHtml = pageHtml.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/,
      `<link rel="canonical" href="${page.url}" />`
    );

    // Replace skeleton inside root with pre-rendered landing markup
    pageHtml = pageHtml.replace(
      /<div id="root">([\s\S]*?)<\/div>/,
      `<div id="root">${page.markup}</div>`
    );

    fs.writeFileSync(page.outFile, pageHtml, 'utf8');
    console.log(`[SSG Prerender] Generated static route: ${page.route} -> ${path.relative(process.cwd(), page.outFile)}`);
  }

  console.log('[SSG Prerender] Completed SSG static generation for all routes successfully!');
}

prerender().catch((err) => {
  console.error('[SSG Prerender] Error during static pre-rendering:', err);
  process.exit(1);
});
