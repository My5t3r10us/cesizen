export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Header } from '@/components/layout/header';
import { CookiePreferencesButton } from '@/components/legal/cookie-preferences-button';
import {
  Leaf, Building2, UserRound, Server, Copyright,
  ShieldCheck, Cookie, Accessibility, Mail, AlertTriangle,
} from 'lucide-react';

const LAST_UPDATE = '19 août 2026';
const CONTACT_EMAIL = 'v.baptiste.moine@gmail.com';

export const metadata: Metadata = {
  title: 'Mentions légales - CESIZen',
  description:
    "Mentions légales de CESIZen : éditeur, directeur de la publication, hébergeur, propriété intellectuelle, traitement des données personnelles, cookies et accessibilité.",
};

/* ── Primitives de mise en page ──────────── */

function Section({
  id, icon: Icon, title, children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-10 border-t border-[#f5f5f7] first:border-t-0">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'rgba(138,154,91,0.12)' }}
        >
          <Icon className="h-4 w-4" style={{ color: '#8A9A5B' }} />
        </span>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-[15px] leading-relaxed text-[#6e6e73]">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4 py-2 border-b border-[#f5f5f7] last:border-b-0">
      <dt className="sm:w-56 shrink-0 text-sm font-medium text-[#1d1d1f]">{label}</dt>
      <dd className="text-[15px] text-[#6e6e73]">{children}</dd>
    </div>
  );
}

/* ── Page ────────────────────────────────── */

export default async function MentionsLegalesPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <Header
        user={
          session
            ? { email: session.email, nom: session.nom, prenom: session.prenom, role: session.role }
            : undefined
        }
      />

      {/* ── EN-TÊTE ──────────────────────────── */}
      <section className="px-4 pt-20 pb-10 text-center">
        <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: '#8A9A5B' }}>
          Informations légales
        </p>
        <h1
          className="max-w-3xl mx-auto text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4"
          style={{ letterSpacing: '-0.03em' }}
        >
          Mentions légales
        </h1>
        <p className="text-[#6e6e73] max-w-xl mx-auto leading-relaxed">
          Éditeur, hébergement, propriété intellectuelle et traitement de vos données
          personnelles sur CESIZen.
        </p>
        <p className="mt-6 text-xs text-[#aeaeb2]">Dernière mise à jour : {LAST_UPDATE}</p>
      </section>

      <main className="container mx-auto px-4 pb-24 max-w-3xl">
        {/* ── AVERTISSEMENT PROJET PÉDAGOGIQUE ── */}
        <div
          className="rounded-2xl p-5 md:p-6 mb-6"
          style={{ background: '#FFF8E6', border: '1px solid #F5E3B3' }}
        >
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#B7791F' }} />
            <div className="space-y-2 text-[15px] leading-relaxed" style={{ color: '#7A5A16' }}>
              <p className="font-semibold" style={{ color: '#5C430F' }}>
                CESIZen est un projet pédagogique.
              </p>
              <p>
                Cette application est réalisée dans le cadre d&apos;une formation au CESI, à des fins
                exclusivement pédagogiques et sans exploitation commerciale. La mention
                «&nbsp;Ministère de la Santé&nbsp;» présente dans l&apos;interface relève du scénario
                fictif du projet : CESIZen n&apos;est ni édité, ni financé, ni approuvé par une
                administration publique française.
              </p>
              <p>
                CESIZen ne constitue pas un dispositif médical et ne remplace ni un diagnostic, ni un
                avis, ni un suivi par un professionnel de santé. En cas de détresse psychologique,
                contactez le 3114 (numéro national de prévention du suicide, gratuit, 24h/24) ou le
                15 en cas d&apos;urgence vitale.
              </p>
            </div>
          </div>
        </div>

        {/* ── SOMMAIRE ─────────────────────────── */}
        <nav aria-label="Sommaire" className="rounded-2xl p-5 md:p-6 mb-4" style={{ background: '#f5f5f7' }}>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#8e8e93] mb-3">Sommaire</p>
          <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-[15px]">
            {[
              ['editeur', 'Éditeur du site'],
              ['publication', 'Directeur de la publication'],
              ['hebergement', 'Hébergement'],
              ['propriete-intellectuelle', 'Propriété intellectuelle'],
              ['donnees-personnelles', 'Données personnelles (RGPD)'],
              ['cookies', 'Cookies'],
              ['accessibilite', 'Accessibilité'],
              ['contact', 'Contact'],
            ].map(([anchor, label]) => (
              <li key={anchor}>
                <a href={`#${anchor}`} className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── 1. ÉDITEUR ───────────────────────── */}
        <Section id="editeur" icon={Building2} title="Éditeur du site">
          <p>
            Conformément à l&apos;article 6-III de la loi n°&nbsp;2004-575 du 21 juin 2004 pour la
            confiance dans l&apos;économie numérique (LCEN), le site CESIZen est édité par&nbsp;:
          </p>
          <dl className="rounded-2xl border border-[#e5e5ea] px-5 py-3">
            <Field label="Éditeur">Baptiste Moine, personne physique</Field>
            <Field label="Statut">
              Étudiant au CESI — projet réalisé dans un cadre pédagogique, à titre non professionnel
              et non lucratif
            </Field>
            <Field label="Contact">
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#1d1d1f]">
                {CONTACT_EMAIL}
              </a>
            </Field>
            <Field label="Nature du site">
              Application web progressive (PWA) de suivi du bien-être mental
            </Field>
          </dl>
          <p className="text-sm text-[#8e8e93]">
            Le site étant édité à titre non professionnel, l&apos;adresse postale de l&apos;éditeur
            n&apos;est pas rendue publique, conformément au second alinéa de l&apos;article 6-III-2 de
            la LCEN. Elle est détenue par l&apos;hébergeur, qui peut la communiquer à l&apos;autorité
            judiciaire.
          </p>
        </Section>

        {/* ── 2. DIRECTEUR DE LA PUBLICATION ──── */}
        <Section id="publication" icon={UserRound} title="Directeur de la publication">
          <dl className="rounded-2xl border border-[#e5e5ea] px-5 py-3">
            <Field label="Directeur de la publication">Baptiste Moine</Field>
            <Field label="Contact">
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#1d1d1f]">
                {CONTACT_EMAIL}
              </a>
            </Field>
          </dl>
          <p>
            Le directeur de la publication est responsable des contenus éditoriaux publiés sur le
            site, notamment des articles de la rubrique{' '}
            <Link href="/conseils" className="underline underline-offset-4 hover:text-[#1d1d1f]">
              Conseils
            </Link>
            .
          </p>
        </Section>

        {/* ── 3. HÉBERGEMENT ───────────────────── */}
        <Section id="hebergement" icon={Server} title="Hébergement">
          <p>Le site est hébergé sur un serveur privé virtuel loué auprès de&nbsp;:</p>
          <dl className="rounded-2xl border border-[#e5e5ea] px-5 py-3">
            <Field label="Hébergeur">OVH SAS (OVHcloud)</Field>
            <Field label="Adresse">2 rue Kellermann, 59100 Roubaix, France</Field>
            <Field label="Téléphone">1007 (depuis la France)</Field>
            <Field label="Site web">
              <a
                href="https://www.ovhcloud.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-[#1d1d1f]"
              >
                www.ovhcloud.com
              </a>
            </Field>
          </dl>
          <p>
            Les données du site et de sa base de données sont stockées et traitées au sein de
            l&apos;Union européenne.
          </p>
        </Section>

        {/* ── 4. PROPRIÉTÉ INTELLECTUELLE ─────── */}
        <Section id="propriete-intellectuelle" icon={Copyright} title="Propriété intellectuelle">
          <p>
            L&apos;ensemble du site — structure, textes, interface, charte graphique et code source —
            est protégé par le code de la propriété intellectuelle. Sauf mention contraire, ces
            éléments sont la propriété de l&apos;éditeur.
          </p>
          <p>
            Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, par
            quelque procédé que ce soit et sur quelque support que ce soit, est interdite sans
            autorisation écrite préalable de l&apos;éditeur, à l&apos;exception des courtes citations
            dûment attribuées et des usages autorisés par la loi.
          </p>
          <p>
            Les contenus que vous saisissez dans l&apos;application (notes du journal émotionnel,
            entrées, informations de profil) restent votre propriété. L&apos;éditeur ne s&apos;en
            attribue aucun droit d&apos;exploitation.
          </p>
          <p className="pt-2 text-sm text-[#8e8e93]">
            <span className="font-medium text-[#1d1d1f]">Crédits techniques.</span> CESIZen est
            construit avec Next.js et React (licence MIT), Tailwind CSS (MIT), les composants
            shadcn/ui (MIT), les icônes Lucide (licence ISC) et la police Inter (SIL Open Font
            License 1.1), auto-hébergée : sa distribution ne déclenche aucune requête vers un
            serveur tiers.
          </p>
        </Section>

        {/* ── 5. DONNÉES PERSONNELLES ─────────── */}
        <Section id="donnees-personnelles" icon={ShieldCheck} title="Données personnelles (RGPD)">
          <p>
            Le traitement des données personnelles est réalisé conformément au règlement (UE)
            2016/679 (RGPD) et à la loi n°&nbsp;78-17 du 6 janvier 1978 modifiée dite
            «&nbsp;Informatique et Libertés&nbsp;». Le responsable de traitement est
            l&apos;éditeur du site, joignable à l&apos;adresse{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#1d1d1f]">
              {CONTACT_EMAIL}
            </a>
            . Compte tenu de la nature pédagogique et de l&apos;échelle du projet, aucun délégué à la
            protection des données (DPO) n&apos;a été désigné.
          </p>

          <h3 className="pt-4 text-base font-semibold text-[#1d1d1f]">Données collectées</h3>
          <div className="overflow-x-auto rounded-2xl border border-[#e5e5ea]">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e5ea] bg-[#fafafa]">
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Données</th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Finalité</th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Base légale</th>
                </tr>
              </thead>
              <tbody className="text-[#6e6e73]">
                <tr className="border-b border-[#f5f5f7]">
                  <td className="px-4 py-3">Adresse e-mail, mot de passe (haché), nom et prénom (facultatifs)</td>
                  <td className="px-4 py-3">Création du compte, authentification, sécurité de la session</td>
                  <td className="px-4 py-3">Exécution du service demandé (art. 6.1.b)</td>
                </tr>
                <tr className="border-b border-[#f5f5f7]">
                  <td className="px-4 py-3">
                    Entrées du journal : émotion, intensité, tags de contexte, date, note libre
                    (chiffrée)
                  </td>
                  <td className="px-4 py-3">Suivi de l&apos;humeur, calendrier et statistiques personnelles</td>
                  <td className="px-4 py-3">Consentement explicite (art. 6.1.a et 9.2.a)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Cookie de session et journaux techniques du serveur</td>
                  <td className="px-4 py-3">Maintien de la connexion, sécurité, prévention des abus</td>
                  <td className="px-4 py-3">Intérêt légitime (art. 6.1.f)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-[#8e8e93]">
            Les entrées du journal peuvent révéler des informations relatives à votre santé mentale.
            Elles constituent à ce titre des données sensibles au sens de l&apos;article 9 du RGPD et
            ne sont traitées que sur la base de votre consentement, matérialisé par leur saisie
            volontaire dans l&apos;application. Aucune donnée n&apos;est vendue, louée, ni transmise à
            des fins publicitaires. Aucun traceur publicitaire ni outil de mesure d&apos;audience tiers
            n&apos;est utilisé.
          </p>

          <h3 className="pt-4 text-base font-semibold text-[#1d1d1f]">Sécurité</h3>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Les notes libres du journal sont chiffrées en base avec l&apos;algorithme AES-256-GCM ;
              elles sont illisibles pour les administrateurs, y compris depuis l&apos;interface
              d&apos;administration.
            </li>
            <li>
              Les mots de passe ne sont jamais stockés en clair : ils sont dérivés avec la fonction
              scrypt et un sel aléatoire propre à chaque compte.
            </li>
            <li>
              La session repose sur un jeton JWT déposé dans un cookie <code>httpOnly</code>,
              inaccessible aux scripts de la page et transmis en <code>Secure</code> +{' '}
              <code>SameSite=Lax</code> en production.
            </li>
            <li>Les échanges avec le serveur sont chiffrés en HTTPS/TLS.</li>
          </ul>

          <h3 className="pt-4 text-base font-semibold text-[#1d1d1f]">Durée de conservation</h3>
          <p>
            Vos données de compte et vos entrées de journal sont conservées tant que votre compte est
            actif. La suppression de votre compte depuis la page{' '}
            <Link href="/dashboard/profil" className="underline underline-offset-4 hover:text-[#1d1d1f]">
              Mon profil
            </Link>{' '}
            entraîne l&apos;effacement immédiat et définitif de votre compte et, par cascade, de la
            totalité de vos entrées de journal. Les journaux techniques du serveur sont conservés au
            maximum douze mois.
          </p>

          <h3 className="pt-4 text-base font-semibold text-[#1d1d1f]">Vos droits</h3>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
            limitation, d&apos;opposition et de portabilité de vos données, ainsi que du droit de
            retirer votre consentement à tout moment. Une partie de ces droits s&apos;exerce
            directement dans l&apos;application : consultation et modification de votre profil,
            modification du mot de passe, suppression d&apos;une entrée de journal, suppression du
            compte.
          </p>
          <p>
            Pour toute autre demande, écrivez à{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#1d1d1f]">
              {CONTACT_EMAIL}
            </a>
            . Une réponse vous sera apportée dans un délai d&apos;un mois. Si vous estimez, après nous
            avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une
            réclamation auprès de la CNIL —{' '}
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[#1d1d1f]"
            >
              www.cnil.fr/fr/plaintes
            </a>{' '}
            — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
          </p>
        </Section>

        {/* ── 6. COOKIES ───────────────────────── */}
        <Section id="cookies" icon={Cookie} title="Cookies">
          <p>
            CESIZen n&apos;utilise que des traceurs strictement nécessaires au fonctionnement du
            service. Ceux-ci sont exemptés de consentement au sens de l&apos;article 82 de la loi
            Informatique et Libertés ; un bandeau d&apos;information reste affiché à des fins de
            transparence.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-[#e5e5ea]">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e5ea] bg-[#fafafa]">
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Nom</th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Type</th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Finalité</th>
                  <th scope="col" className="px-4 py-3 font-medium text-[#1d1d1f]">Durée</th>
                </tr>
              </thead>
              <tbody className="text-[#6e6e73]">
                <tr className="border-b border-[#f5f5f7]">
                  <td className="px-4 py-3 font-mono text-xs">session</td>
                  <td className="px-4 py-3">Cookie <code>httpOnly</code></td>
                  <td className="px-4 py-3">Maintien de votre connexion (jeton d&apos;authentification)</td>
                  <td className="px-4 py-3">7 jours</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">cesizen-cookie-consent</td>
                  <td className="px-4 py-3">Stockage local du navigateur</td>
                  <td className="px-4 py-3">Mémorisation de votre choix pour ne plus afficher le bandeau</td>
                  <td className="px-4 py-3">Jusqu&apos;à effacement des données du navigateur</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Aucun cookie publicitaire, de profilage ou de mesure d&apos;audience tierce n&apos;est
            déposé. Vous pouvez revoir votre choix à tout moment&nbsp;:
          </p>
          <div className="pt-1">
            <CookiePreferencesButton />
          </div>
          <p className="text-sm text-[#8e8e93]">
            Le refus ou la suppression du cookie de session vous déconnecte et empêche
            l&apos;utilisation des fonctionnalités nécessitant un compte.
          </p>
        </Section>

        {/* ── 7. ACCESSIBILITÉ ─────────────────── */}
        <Section id="accessibilite" icon={Accessibility} title="Accessibilité">
          <p>
            L&apos;accessibilité numérique est prise en compte dans la conception de CESIZen&nbsp;:
            structure sémantique des pages, navigation au clavier, libellés explicites des champs de
            formulaire, contrastes de couleurs et affichage responsive du mobile à l&apos;ordinateur.
          </p>
          <p>
            <span className="font-medium text-[#1d1d1f]">État de conformité&nbsp;: non conforme.</span>{' '}
            Aucun audit RGAA 4.1 complet n&apos;a été réalisé à ce jour. Ce site n&apos;a donc pas
            fait l&apos;objet d&apos;une déclaration d&apos;accessibilité au sens de l&apos;article 47
            de la loi n°&nbsp;2005-102 du 11 février 2005 — obligation qui ne s&apos;applique pas à un
            projet pédagogique privé, mais dont nous appliquons volontairement l&apos;esprit.
          </p>
          <p>
            Si vous rencontrez une difficulté d&apos;accès à un contenu ou à une fonctionnalité,
            signalez-la à{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#1d1d1f]">
              {CONTACT_EMAIL}
            </a>{' '}
            : une alternative vous sera proposée dans la mesure du possible.
          </p>
        </Section>

        {/* ── 8. CONTACT ───────────────────────── */}
        <Section id="contact" icon={Mail} title="Contact">
          <p>
            Pour toute question relative au site, à son contenu, à vos données personnelles ou pour
            signaler un contenu illicite&nbsp;:
          </p>
          <dl className="rounded-2xl border border-[#e5e5ea] px-5 py-3">
            <Field label="Adresse e-mail">
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-[#1d1d1f]">
                {CONTACT_EMAIL}
              </a>
            </Field>
            <Field label="Délai de réponse indicatif">
              Un mois pour les demandes relatives aux données personnelles
            </Field>
          </dl>
          <p className="text-sm text-[#8e8e93]">
            L&apos;éditeur se réserve le droit de modifier les présentes mentions légales à tout
            moment. La version applicable est celle publiée sur cette page à la date de votre
            consultation.
          </p>
        </Section>
      </main>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="border-t border-[#f5f5f7]">
        <div className="container mx-auto px-4 py-8 max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4" style={{ color: '#8A9A5B' }} />
            <span className="text-sm font-semibold text-[#1d1d1f]">CESIZen</span>
          </div>
          <p className="text-xs text-[#aeaeb2]">
            © 2025 CESIZen · Ministère de la Santé · Tous droits réservés
          </p>
          <div className="flex gap-6">
            <Link href="/conseils" className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Conseils</Link>
            <Link href="/mentions-legales" className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
