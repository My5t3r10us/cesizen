import 'dotenv/config';
import { db } from './index';
import { emotions } from './schema';
import { eq } from 'drizzle-orm';
import { generateColorVariations } from '../colors';

async function migrateEmotionColors() {
  console.log('🎨 Migrating emotion colors...');

  const categories = await db.query.emotionCategories.findMany({
    with: {
      emotions: true,
    },
  });

  let updatedCount = 0;

  for (const category of categories) {
    if (!category.emotions || category.emotions.length === 0) {
      console.log(`⏭️  Skipping category "${category.label}" (no emotions)`);
      continue;
    }

    const colorVariations = generateColorVariations(category.colorHex);
    console.log(`\n📂 Processing category: ${category.label} (${category.colorHex})`);
    console.log(`   Generated ${colorVariations.length} color variations`);

    for (let i = 0; i < category.emotions.length; i++) {
      const emotion = category.emotions[i];
      const colorIndex = i % colorVariations.length;
      const newColor = colorVariations[colorIndex];

      if (emotion.colorHex !== newColor) {
        await db.update(emotions)
          .set({ colorHex: newColor })
          .where(eq(emotions.id, emotion.id));

        console.log(`   ✓ ${emotion.label}: ${emotion.colorHex || 'null'} → ${newColor}`);
        updatedCount++;
      } else {
        console.log(`   - ${emotion.label}: ${newColor} (unchanged)`);
      }
    }
  }

  console.log(`\n✅ Migration complete! Updated ${updatedCount} emotions with color variations.`);
}

migrateEmotionColors()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
