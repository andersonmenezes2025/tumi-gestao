// Script para substituir todas as importações do Supabase
const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Substituir importações do supabase/client
  if (content.includes("from '@/integrations/supabase/client'")) {
    content = content.replace(/import.*from '@\/integrations\/supabase\/client';?/g, "import { apiClient } from '@/lib/api-client';");
    content = content.replace(/supabase\./g, 'apiClient.');
    changed = true;
  }

  // Substituir importações dos types
  if (content.includes("from '@/integrations/supabase/types'")) {
    content = content.replace(/import.*from '@\/integrations\/supabase\/types';?/g, "import * as DatabaseTypes from '@/types/database';");
    content = content.replace(/Tables</g, 'DatabaseTypes.');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      walkDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

walkDir('./src');
console.log('Substituições concluídas!');