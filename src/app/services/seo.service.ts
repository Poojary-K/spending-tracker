import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private baseUrl = 'https://devk-spend-tracker.netlify.app';
  private defaultImage = `${this.baseUrl}/spend-tracker-icon.png`;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private meta: Meta,
    private title: Title
  ) {}

  /**
   * Update SEO meta tags for the current page
   * @param seoData - SEO data object containing title, description, etc.
   */
  updateSEO(seoData: SEOData): void {
    const {
      title,
      description,
      keywords = 'expense tracker, personal finance, money management, budget tracker, spending tracker, financial app',
      image = this.defaultImage,
      url = this.baseUrl,
      type = 'website'
    } = seoData;

    // Update title
    this.title.setTitle(title);

    // Update meta description
    this.meta.updateTag({ name: 'description', content: description });

    // Update keywords
    this.meta.updateTag({ name: 'keywords', content: keywords });

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });

    // Update Twitter Card tags
    this.meta.updateTag({ property: 'twitter:title', content: title });
    this.meta.updateTag({ property: 'twitter:description', content: description });
    this.meta.updateTag({ property: 'twitter:image', content: image });

    // Update canonical URL
    this.updateCanonicalUrl(url);
  }

  /**
   * Update canonical URL for the current page
   * @param url - The canonical URL
   */
  private updateCanonicalUrl(url: string): void {
    let canonicalLink = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url);
    } else {
      canonicalLink = this.document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', url);
      this.document.head.appendChild(canonicalLink);
    }
  }

  /**
   * Get SEO data for different routes
   */
  getRouteSEOData(route: string): SEOData {
    const routeData: { [key: string]: SEOData } = {
      'dashboard': {
        title: 'Dashboard - Spend Tracker | Personal Finance Management',
        description: 'View your financial dashboard with expense summaries, income tracking, and financial health insights. Monitor your spending patterns and financial goals.',
        keywords: 'financial dashboard, expense summary, income tracking, financial insights, spending patterns, budget overview'
      },
      'add': {
        title: 'Add Expense - Spend Tracker | Track Your Spending',
        description: 'Add new expenses to your personal finance tracker. Record spending details, categories, and amounts to maintain accurate financial records.',
        keywords: 'add expense, record spending, expense tracking, financial records, spending categories'
      },
      'data': {
        title: 'Data Management - Spend Tracker | Import Export Financial Data',
        description: 'Import and export your financial data with Spend Tracker. Backup your expense records and import data from other financial applications.',
        keywords: 'data import, data export, financial backup, expense data, financial records backup'
      },
      'split': {
        title: 'Split Calculator - Spend Tracker | Shared Expense Calculator',
        description: 'Calculate shared expenses and split bills with friends and family. Easy-to-use split calculator for group expenses and shared costs.',
        keywords: 'split calculator, shared expenses, bill splitting, group expenses, expense sharing'
      },
      'lending': {
        title: 'Lending Records - Spend Tracker | Track Loans and Borrowing',
        description: 'Manage your lending and borrowing records. Track money lent to others and money borrowed, with repayment tracking and financial insights.',
        keywords: 'lending records, borrowing tracking, loan management, money lending, debt tracking'
      },
      'income': {
        title: 'Income Management - Spend Tracker | Track Your Income',
        description: 'Record and manage your income sources. Track salary, freelance income, and other earnings to get a complete picture of your finances.',
        keywords: 'income tracking, salary recording, earnings management, income sources, financial income'
      }
    };

    return routeData[route] || {
      title: 'Spend Tracker - Free Personal Finance & Expense Management App',
      description: 'Track your expenses, manage income, and monitor your financial health with our free personal finance app. Features expense tracking, income management, lending records, and financial insights.',
      keywords: 'expense tracker, personal finance, money management, budget tracker, spending tracker, financial app'
    };
  }
}
