import 'dotenv/config';
import { db } from './index';
import { emotionCategories, emotions, users, articleCategories, articles } from './schema';
import { hashPassword } from '../auth/password';
import { eq } from 'drizzle-orm';
import { generateColorVariations } from '../colors';

// Référentiel des catégories d'émotions (émotions de base)
const categories = [
  { label: 'Joie', colorHex: '#FFD700', iconName: 'smile' },
  { label: 'Colère', colorHex: '#FF6B6B', iconName: 'flame' },
  { label: 'Peur', colorHex: '#9370DB', iconName: 'alert-triangle' },
  { label: 'Tristesse', colorHex: '#6495ED', iconName: 'frown' },
  { label: 'Surprise', colorHex: '#FFA500', iconName: 'zap' },
  { label: 'Dégoût', colorHex: '#8B4513', iconName: 'thumbs-down' },
];

// Référentiel des émotions par catégorie
const emotionsByCategory: Record<string, string[]> = {
  'Joie': ['Fierté', 'Contentement', 'Enchantement', 'Excitation', 'Émerveillement', 'Gratitude'],
  'Colère': ['Frustration', 'Irritation', 'Rage', 'Ressentiment', 'Agacement', 'Hostilité'],
  'Peur': ['Inquiétude', 'Anxiété', 'Terreur', 'Appréhension', 'Panique', 'Crainte'],
  'Tristesse': ['Chagrin', 'Mélancolie', 'Abattement', 'Désespoir', 'Solitude', 'Dépression'],
  'Surprise': ['Étonnement', 'Stupéfaction', 'Sidération', 'Incrédulité', 'Émerveillement', 'Confusion'],
  'Dégoût': ['Répulsion', 'Déplaisir', 'Nausée', 'Dédain', 'Horreur', 'Dégoût profond'],
};

// Catégories d'articles
const articleCats = [
  { label: 'Bien-être', slug: 'bien-etre', colorHex: '#8A9A5B' },
  { label: 'Méditation', slug: 'meditation', colorHex: '#7B68EE' },
  { label: 'Sommeil', slug: 'sommeil', colorHex: '#4682B4' },
  { label: 'Nutrition', slug: 'nutrition', colorHex: '#32CD32' },
  { label: 'Sport', slug: 'sport', colorHex: '#FF6347' },
  { label: 'Santé mentale', slug: 'sante-mentale', colorHex: '#DDA0DD' },
];

// Articles publiés affichés dans la page Conseils
const seededArticles = [
  {
    title: '5 habitudes simples pour prendre soin de son bien-être au quotidien',
    slug: '5-habitudes-bien-etre-quotidien',
    categorySlug: 'bien-etre',
    excerpt:
      'Des habitudes accessibles pour retrouver de l’énergie, préserver son équilibre et mieux vivre ses journées.',
    content: `
      <p>Prendre soin de soi ne demande pas forcément de bouleverser son emploi du temps. Des gestes courts, répétés avec régularité, peuvent déjà améliorer la qualité de vie et aider à traverser les périodes chargées.</p>
      <h2>1. Commencer la journée sans se précipiter</h2>
      <p>Avant de consulter vos notifications, accordez-vous quelques minutes pour vous étirer, boire un verre d’eau et identifier votre priorité du jour. Ce temps de transition aide à commencer la journée de façon plus intentionnelle.</p>
      <h2>2. Faire de vraies pauses</h2>
      <p>Toutes les 60 à 90 minutes, quittez votre écran pendant quelques instants. Marchez, regardez au loin ou respirez calmement. Une pause courte mais réelle permet de relâcher la tension et de retrouver de l’attention.</p>
      <h2>3. Mettre du mouvement dans la journée</h2>
      <p>Prendre les escaliers, marcher pendant un appel ou descendre un arrêt plus tôt sont autant d’occasions de bouger. L’objectif n’est pas la performance, mais la régularité.</p>
      <h2>4. Préserver un moment agréable</h2>
      <p>Lecture, musique, cuisine, échange avec un proche : planifiez chaque jour une activité qui n’a pas d’autre but que de vous faire du bien. Même quinze minutes comptent.</p>
      <h2>5. Faire un bilan bienveillant</h2>
      <p>Le soir, notez une chose accomplie, une émotion ressentie et un besoin pour le lendemain. Cet exercice développe la connaissance de soi sans transformer la journée en liste de performances.</p>
      <p><strong>À retenir :</strong> choisissez une seule habitude, rendez-la facile à réaliser et observez ses effets pendant une semaine avant d’en ajouter une autre.</p>
    `,
  },
  {
    title: 'Méditation : un exercice guidé de 5 minutes pour débuter',
    slug: 'meditation-guidee-5-minutes-debuter',
    categorySlug: 'meditation',
    excerpt:
      'Une pratique courte, sans matériel, pour découvrir la méditation et revenir au moment présent.',
    content: `
      <p>La méditation ne consiste pas à arrêter de penser. Elle invite plutôt à remarquer ce qui se passe, sans chercher immédiatement à le modifier. Voici une pratique simple à essayer assis sur une chaise ou un coussin.</p>
      <h2>Minute 1 : s’installer</h2>
      <p>Posez les pieds au sol, relâchez les épaules et laissez vos mains reposer confortablement. Vous pouvez fermer les yeux ou garder le regard posé devant vous.</p>
      <h2>Minutes 2 et 3 : suivre la respiration</h2>
      <p>Portez votre attention sur les sensations de l’air qui entre et sort, ou sur le mouvement du ventre. Il n’est pas nécessaire de respirer plus profondément : observez simplement votre rythme naturel.</p>
      <h2>Minute 4 : accueillir les distractions</h2>
      <p>Lorsque vous remarquez une pensée, un bruit ou une sensation, nommez-le mentalement — « pensée », « son », « tension » — puis revenez doucement à la respiration. Se distraire n’est pas un échec : le retour de l’attention fait partie de l’exercice.</p>
      <h2>Minute 5 : élargir l’attention</h2>
      <p>Prenez conscience de l’ensemble du corps et de l’espace autour de vous. Avant de terminer, observez votre état sans chercher un résultat particulier.</p>
      <h2>Installer une pratique durable</h2>
      <p>Choisissez un repère régulier, par exemple après le petit-déjeuner ou avant de commencer à travailler. Cinq minutes pratiquées souvent sont plus utiles qu’une longue séance occasionnelle.</p>
    `,
  },
  {
    title: 'Mieux dormir : préparer une routine du soir qui fonctionne',
    slug: 'mieux-dormir-routine-du-soir',
    categorySlug: 'sommeil',
    excerpt:
      'Des repères concrets pour faciliter l’endormissement et créer des conditions favorables à un sommeil réparateur.',
    content: `
      <p>Le sommeil dépend de nombreux facteurs, mais une routine régulière aide le cerveau à reconnaître l’approche du repos. L’idée n’est pas de suivre un rituel parfait : il s’agit de créer des repères simples et réalistes.</p>
      <h2>Garder des horaires relativement réguliers</h2>
      <p>Essayez de vous lever à une heure proche chaque jour, y compris le week-end. Cette régularité soutient l’horloge biologique et peut faciliter l’endormissement le soir suivant.</p>
      <h2>Créer une zone de transition</h2>
      <p>Trente à soixante minutes avant le coucher, diminuez progressivement les activités stimulantes. Préparez les affaires du lendemain, tamisez la lumière, lisez ou écoutez un contenu calme.</p>
      <h2>Réduire ce qui perturbe le sommeil</h2>
      <ul>
        <li>Évitez la caféine en fin de journée si vous y êtes sensible.</li>
        <li>Limitez les repas très copieux et l’alcool juste avant le coucher.</li>
        <li>Placez le téléphone hors de portée et désactivez les notifications nocturnes.</li>
        <li>Gardez une chambre sombre, calme et plutôt fraîche.</li>
      </ul>
      <h2>Que faire quand le sommeil ne vient pas ?</h2>
      <p>Si vous restez éveillé longtemps, levez-vous et pratiquez une activité tranquille dans une lumière faible. Retournez au lit lorsque la somnolence revient, afin de ne pas associer durablement le lit à l’éveil et à la frustration.</p>
      <p>Des difficultés persistantes, des réveils avec sensation d’étouffement ou une fatigue importante dans la journée méritent d’être abordés avec un professionnel de santé.</p>
    `,
  },
  {
    title: 'Composer des repas équilibrés sans régime compliqué',
    slug: 'repas-equilibres-sans-regime',
    categorySlug: 'nutrition',
    excerpt:
      'Une méthode souple pour composer des repas variés, rassasiants et adaptés à un quotidien chargé.',
    content: `
      <p>Bien manger ne se résume pas à compter chaque calorie ni à interdire des aliments. Une alimentation équilibrée se construit surtout dans la durée, grâce à la variété et à des repas suffisamment nourrissants.</p>
      <h2>Une assiette facile à visualiser</h2>
      <p>Pour un repas principal, imaginez une assiette composée pour moitié de légumes, pour un quart d’une source de protéines et pour un quart de féculents. Ajoutez une matière grasse en quantité adaptée, un produit laitier ou une alternative, et un fruit selon votre faim.</p>
      <h2>Prévoir quelques bases polyvalentes</h2>
      <p>Des légumes surgelés nature, des œufs, des légumineuses en conserve, du riz, des pâtes complètes et quelques fruits permettent d’improviser rapidement. Préparer deux ou trois portions à la fois évite de repartir de zéro à chaque repas.</p>
      <h2>Écouter les signaux du corps</h2>
      <p>Avant et pendant le repas, demandez-vous où se situent votre faim et votre rassasiement. Manger plus lentement, sans écran lorsque c’est possible, laisse davantage de temps pour percevoir ces signaux.</p>
      <h2>Conserver le plaisir</h2>
      <p>Aucun aliment isolé ne définit la qualité globale de l’alimentation. Les repas conviviaux et les aliments appréciés ont leur place dans un équilibre durable.</p>
      <p>En cas d’allergie, de maladie chronique, de trouble du comportement alimentaire ou de besoin nutritionnel particulier, demandez un accompagnement personnalisé à un professionnel qualifié.</p>
    `,
  },
  {
    title: 'Bouger davantage quand on passe la journée assis',
    slug: 'bouger-davantage-journee-assis',
    categorySlug: 'sport',
    excerpt:
      'Des idées concrètes pour réduire la sédentarité et remettre progressivement du mouvement dans sa journée.',
    content: `
      <p>Rester assis plusieurs heures d’affilée peut provoquer raideurs, fatigue et baisse d’attention. Il n’est pas nécessaire d’être sportif pour agir : interrompre régulièrement la position assise constitue déjà un bon point de départ.</p>
      <h2>Commencer par des pauses de mouvement</h2>
      <p>Programmez un rappel toutes les heures. Levez-vous deux ou trois minutes, marchez jusqu’à une autre pièce, mobilisez doucement les épaules et changez de posture.</p>
      <h2>Transformer les déplacements ordinaires</h2>
      <ul>
        <li>Marchez pendant certains appels téléphoniques.</li>
        <li>Utilisez les escaliers lorsque cela vous convient.</li>
        <li>Garez-vous un peu plus loin ou descendez un arrêt plus tôt.</li>
        <li>Proposez une courte réunion en marchant.</li>
      </ul>
      <h2>Construire une activité progressive</h2>
      <p>Choisissez une activité accessible et agréable : marche rapide, vélo, natation, danse ou renforcement à la maison. Commencez par des séances courtes, puis augmentez progressivement leur durée ou leur fréquence.</p>
      <h2>Respecter les signaux d’alerte</h2>
      <p>Une légère fatigue musculaire peut accompagner la reprise. En revanche, une douleur vive, un malaise, une gêne thoracique ou un essoufflement inhabituel justifient d’arrêter l’effort et de demander un avis médical.</p>
      <p><strong>Le bon objectif :</strong> trouver une organisation que vous pouvez répéter, plutôt que viser une séance parfaite difficile à maintenir.</p>
    `,
  },
  {
    title: 'Stress et anxiété : reconnaître les signaux et demander de l’aide',
    slug: 'stress-anxiete-signaux-demander-aide',
    categorySlug: 'sante-mentale',
    excerpt:
      'Comprendre les manifestations du stress, tester des stratégies d’apaisement et savoir quand consulter.',
    content: `
      <p>Le stress est une réaction normale face à une contrainte ou à un changement. Il devient préoccupant lorsqu’il dure, envahit plusieurs domaines de la vie ou empêche de récupérer. Reconnaître ses signaux permet d’agir plus tôt.</p>
      <h2>Des signes parfois discrets</h2>
      <p>Le stress peut se manifester par des tensions musculaires, des troubles du sommeil, de l’irritabilité, des difficultés de concentration, des ruminations ou l’envie d’éviter certaines situations. Ces réactions varient d’une personne à l’autre.</p>
      <h2>Faire redescendre la pression à court terme</h2>
      <ul>
        <li>Allongez doucement l’expiration pendant quelques respirations.</li>
        <li>Nommez ce que vous ressentez et ce dont vous avez besoin maintenant.</li>
        <li>Découpez la prochaine action en une étape très simple.</li>
        <li>Parlez à une personne de confiance au lieu de rester seul avec la difficulté.</li>
      </ul>
      <h2>Agir sur les causes quand c’est possible</h2>
      <p>Repérez les situations qui déclenchent ou entretiennent la tension. Clarifier une attente, poser une limite, réorganiser une charge de travail ou demander du soutien peut réduire durablement la pression.</p>
      <h2>Quand demander de l’aide ?</h2>
      <p>Consultez un médecin ou un professionnel de la santé mentale si les symptômes persistent, s’intensifient, perturbent votre sommeil, vos études, votre travail ou vos relations. Demander de l’aide est une démarche de soin, pas un signe de faiblesse.</p>
      <p><strong>En cas de danger immédiat ou d’idées suicidaires, contactez sans attendre les services d’urgence de votre pays ou rendez-vous aux urgences.</strong></p>
    `,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed categories
  console.log('📂 Seeding emotion categories...');
  for (const category of categories) {
    await db.insert(emotionCategories).values(category).onConflictDoNothing();
  }
  console.log(`✅ ${categories.length} categories seeded`);

  // Seed emotions
  console.log('📊 Seeding emotions...');
  let emotionCount = 0;
  for (const [categoryLabel, emotionLabels] of Object.entries(emotionsByCategory)) {
    const category = await db.query.emotionCategories.findFirst({
      where: eq(emotionCategories.label, categoryLabel),
    });
    
    if (category) {
      const colorVariations = generateColorVariations(category.colorHex);
      
      for (let i = 0; i < emotionLabels.length; i++) {
        const label = emotionLabels[i];
        const colorIndex = i % colorVariations.length;
        
        await db.insert(emotions).values({
          label,
          categoryId: category.id,
          colorHex: colorVariations[colorIndex],
        }).onConflictDoNothing();
        emotionCount++;
      }
    }
  }
  console.log(`✅ ${emotionCount} emotions seeded with color variations`);

  // Seed article categories
  console.log('📰 Seeding article categories...');
  for (const cat of articleCats) {
    await db.insert(articleCategories).values(cat).onConflictDoNothing();
  }
  console.log(`✅ ${articleCats.length} article categories seeded`);

  // Seed admin user
  console.log('👤 Creating admin user...');
  const adminEmail = 'admin@cesizen.fr';
  const adminPassword = hashPassword('Admin123!');
  
  await db.insert(users).values({
    email: adminEmail,
    passwordHash: adminPassword,
    nom: 'Admin',
    prenom: 'CESIZen',
    role: 'admin',
  }).onConflictDoNothing();
  
  console.log(`✅ Admin user created: ${adminEmail}`);

  // Seed published articles
  console.log('📝 Seeding articles...');
  const admin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!admin) {
    throw new Error('Admin user not found after seeding');
  }

  let articleCount = 0;
  for (const article of seededArticles) {
    const category = await db.query.articleCategories.findFirst({
      where: eq(articleCategories.slug, article.categorySlug),
    });

    if (!category) {
      throw new Error(`Article category not found: ${article.categorySlug}`);
    }

    await db.insert(articles).values({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      categoryId: category.id,
      authorId: admin.id,
      isPublished: true,
    }).onConflictDoNothing();
    articleCount++;
  }
  console.log(`✅ ${articleCount} articles seeded`);

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
