/**
 * Journal Safe MVP - Export Data Utilities
 * Handles exporting journal entries as JSON or PDF
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllLocalEntries } from './journalStorage';
import { LocalJournalEntry } from '~/types/journal';
import { ExportFormat } from '~/types/settings';

/**
 * Exports journal entries as JSON
 */
export async function exportAsJSON(): Promise<void> {
  try {
    const entries = await getAllLocalEntries();

    if (entries.length === 0) {
      throw new Error('No journal entries to export');
    }

    // Create export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      entryCount: entries.length,
      entries: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        createdAt: entry.clientCreatedAt,
        updatedAt: entry.updatedAt,
        photoUrl: entry.photoUrl,
      })),
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create file
    const fileName = `journal_export_${new Date().getTime()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share file
    await shareFile(fileUri, fileName);
  } catch (error) {
    console.error('Failed to export as JSON:', error);
    throw error;
  }
}

/**
 * Exports journal entries as PDF (simplified text version)
 * Note: This is a basic implementation. For better PDF generation,
 * consider using a library like react-native-html-to-pdf
 */
export async function exportAsPDF(): Promise<void> {
  try {
    const entries = await getAllLocalEntries();

    if (entries.length === 0) {
      throw new Error('No journal entries to export');
    }

    // Create text content for PDF
    let textContent = 'Journal Safe - My Journal Entries\n\n';
    textContent += `Exported: ${new Date().toLocaleString()}\n`;
    textContent += `Total Entries: ${entries.length}\n\n`;
    textContent += '='.repeat(50) + '\n\n';

    entries.forEach((entry, index) => {
      textContent += `Entry ${index + 1}\n`;
      textContent += '-'.repeat(30) + '\n';
      textContent += `Date: ${new Date(entry.clientCreatedAt).toLocaleString()}\n`;

      if (entry.title) {
        textContent += `Title: ${entry.title}\n`;
      }

      if (entry.mood) {
        textContent += `Mood: ${entry.mood}\n`;
      }

      textContent += '\n';
      textContent += entry.content;
      textContent += '\n\n';
      textContent += '='.repeat(50) + '\n\n';
    });

    // Create file (as .txt since we're not generating actual PDF)
    const fileName = `journal_export_${new Date().getTime()}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, textContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share file
    await shareFile(fileUri, fileName);
  } catch (error) {
    console.error('Failed to export as PDF:', error);
    throw error;
  }
}

/**
 * Shares a file using native share sheet
 */
async function shareFile(fileUri: string, fileName: string): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: fileName.endsWith('.json') ? 'application/json' : 'text/plain',
      dialogTitle: 'Export Journal Entries',
      UTI: fileName.endsWith('.json') ? 'public.json' : 'public.plain-text',
    });
  } catch (error) {
    console.error('Failed to share file:', error);
    throw error;
  }
}

/**
 * Exports entries based on format
 */
export async function exportEntries(format: ExportFormat): Promise<void> {
  if (format === 'json') {
    await exportAsJSON();
  } else if (format === 'pdf') {
    await exportAsPDF();
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Gets exportable entry count
 */
export async function getExportableCount(): Promise<number> {
  try {
    const entries = await getAllLocalEntries();
    return entries.length;
  } catch (error) {
    console.error('Failed to get exportable count:', error);
    return 0;
  }
}
