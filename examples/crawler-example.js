#!/usr/bin/env node

/**
 * Example script demonstrating how to use the crawler API
 * 
 * Usage:
 *   1. Start the server: npm run start:dev
 *   2. Run this script: node examples/crawler-example.js
 */

const BASE_URL = 'http://localhost:3000';

async function crawlWebsite(url) {
  console.log(`\n📡 Crawling: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/crawler/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Crawl completed successfully!');
      console.log(`   Job ID: ${result.data.jobId}`);
      console.log(`   Page ID: ${result.data.pageId}`);
      console.log(`   Title: ${result.data.title}`);
    } else {
      console.log('❌ Crawl failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getAllPages() {
  console.log('\n📚 Fetching all crawled pages...');
  
  try {
    const response = await fetch(`${BASE_URL}/crawler/pages`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} pages:`);
      result.data.forEach((page, index) => {
        console.log(`   ${index + 1}. [ID: ${page.id}] ${page.title} - ${page.url}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getPage(id) {
  console.log(`\n🔍 Fetching page with ID: ${id}`);
  
  try {
    const response = await fetch(`${BASE_URL}/crawler/pages/${id}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Page found:');
      console.log(`   URL: ${result.data.url}`);
      console.log(`   Title: ${result.data.title}`);
      console.log(`   Created: ${result.data.createdAt}`);
      console.log(`   Updated: ${result.data.updatedAt}`);
    } else {
      console.log('❌ Page not found');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function getAllJobs() {
  console.log('\n📋 Fetching all crawl jobs...');
  
  try {
    const response = await fetch(`${BASE_URL}/crawler/jobs`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found ${result.data.length} jobs:`);
      result.data.forEach((job, index) => {
        const statusEmoji = job.status === 'completed' ? '✅' : 
                           job.status === 'failed' ? '❌' : 
                           job.status === 'running' ? '🔄' : '⏳';
        console.log(`   ${index + 1}. ${statusEmoji} [ID: ${job.id}] ${job.url} - ${job.status}`);
        if (job.error) {
          console.log(`      Error: ${job.error}`);
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Crawler API Example\n');
  console.log('Make sure the server is running on http://localhost:3000');
  console.log('Start it with: npm run start:dev\n');
  
  // Note: example.com may not work in all environments due to network restrictions
  // Replace with a local test file or accessible URL in your environment
  
  console.log('='.repeat(60));
  await crawlWebsite('https://example.com');
  
  console.log('\n' + '='.repeat(60));
  await getAllPages();
  
  console.log('\n' + '='.repeat(60));
  await getAllJobs();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Example completed!\n');
}

// Run the example
main().catch(console.error);
