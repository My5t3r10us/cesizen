export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Leaf, Heart, Brain, Shield, BookOpen,
  Wind, ArrowRight, CheckCircle2,
} from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <Header user={session ? { email: session.email, nom: session.nom, prenom: session.prenom, role: session.role } : undefined} />

      {/* ── HERO ─────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center pt-32 pb-24 px-4">
        <p className="text-sm font-medium text-[#8A9A5B] tracking-widest uppercase mb-6 lp-fade-1">
          Bien-être &amp; Santé mentale
        </p>

        <h1 className="lp-fade-2 max-w-3xl text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.07] mb-6" style={{ letterSpacing: '-0.03em' }}>
          Prenez soin de<br />
          <span style={{ color: '#8A9A5B' }}>vous, chaque jour.</span>
        </h1>

        <p className="lp-fade-3 text-lg md:text-xl text-[#6e6e73] max-w-xl mb-10 leading-relaxed">
          Un espace intime pour comprendre vos émotions, suivre votre bien-être
          et accéder à des ressources bienveillantes.
        </p>

        <div className="lp-fade-4 flex flex-col sm:flex-row gap-3 justify-center">
          {session ? (
            <Button size="lg" asChild className="rounded-full px-8 text-[15px] font-medium" style={{ background: '#8A9A5B' }}>
              <Link href="/dashboard">
                <Leaf className="mr-2 h-4 w-4" />
                Accéder à mon espace
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild className="rounded-full px-8 text-[15px] font-medium" style={{ background: '#1d1d1f', color: '#fff' }}>
                <Link href="/register">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 text-[15px] font-medium border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]">
                <Link href="/login">Se connecter</Link>
              </Button>
            </>
          )}
        </div>

        {/* Breathing orb */}
        <div className="lp-fade-5 relative mt-20 mb-2" style={{ width: 160, height: 160 }}>
          <div className="lp-breathe-outer absolute inset-0 rounded-full" style={{ background: 'rgba(138,154,91,0.10)' }} />
          <div className="lp-breathe-mid   absolute rounded-full" style={{ inset: '16%', background: 'rgba(138,154,91,0.18)' }} />
          <div className="lp-breathe-core  absolute rounded-full flex flex-col items-center justify-center gap-1" style={{ inset: '31%', background: '#8A9A5B' }}>
            <Wind className="text-white" style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em' }}>RESPIREZ</span>
          </div>
        </div>
        <p className="text-xs text-[#aeaeb2] tracking-widest uppercase">Exercice de respiration</p>
      </section>

      {/* ── SÉPARATEUR ──────────────────────── */}
      <div className="h-px bg-[#f5f5f7] mx-4" />

      {/* ── FEATURES ────────────────────────── */}
      <section className="py-28 px-4" style={{ background: '#f5f5f7' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
              Conçu pour votre équilibre.
            </h2>
            <p className="text-[#6e6e73] text-lg max-w-lg mx-auto">
              Trois outils simples et puissants pour transformer votre rapport à vos émotions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {([
              {
                Icon: Heart,
                title: 'Journal émotionnel',
                desc: "Consignez vos ressentis au fil des jours avec une interface épurée. Votre espace, vos mots.",
                items: ['Plus de 50 émotions', 'Calendrier mensuel', 'Entrées chiffrées'],
              },
              {
                Icon: Brain,
                title: 'Analyses & tendances',
                desc: "Des graphiques clairs pour comprendre vos cycles émotionnels sur la durée.",
                items: ['Graphiques évolutifs', 'Analyse hebdomadaire', 'Tendances mensuelles'],
              },
              {
                Icon: BookOpen,
                title: "Ressources d'experts",
                desc: "Une bibliothèque d'articles validés par des professionnels du bien-être mental.",
                items: ['Articles validés', 'Guides pratiques', 'Mises à jour régulières'],
              },
            ] as const).map(({ Icon, title, desc, items }) => (
              <div key={title} className="lp-card bg-white rounded-2xl p-8">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(138,154,91,0.10)' }}>
                  <Icon className="h-5 w-5" style={{ color: '#8A9A5B' }} />
                </div>
                <h3 className="text-[17px] font-semibold mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-[#6e6e73] mb-6 leading-relaxed">{desc}</p>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[#1d1d1f]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#8A9A5B' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITATION ────────────────────────── */}
      <section className="py-32 px-4 text-center bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-[5rem] leading-none font-serif text-[#d2d2d7] select-none -mb-4">&ldquo;</div>
          <blockquote className="text-2xl md:text-3xl font-medium text-[#1d1d1f] leading-snug tracking-tight mb-8" style={{ letterSpacing: '-0.015em' }}>
            La santé mentale n&apos;est pas une destination.<br />
            C&apos;est un voyage quotidien.
          </blockquote>
          <div className="flex items-center justify-center gap-3 text-sm text-[#aeaeb2]">
            <div className="h-px w-10 bg-[#d2d2d7]" />
            <Leaf className="h-3.5 w-3.5" style={{ color: '#8A9A5B' }} />
            <span>CESIZen</span>
            <div className="h-px w-10 bg-[#d2d2d7]" />
          </div>
        </div>
      </section>

      {/* ── CTA (invités) ───────────────────── */}
      {!session && (
        <section className="py-28 px-4" style={{ background: '#f5f5f7' }}>
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
              Prêt à commencer ?
            </h2>
            <p className="text-[#6e6e73] text-lg mb-10">
              Gratuit. Sécurisé. Bienveillant.
            </p>
            <Button size="lg" asChild className="rounded-full px-10 text-[15px] font-medium" style={{ background: '#1d1d1f', color: '#fff' }}>
              <Link href="/register">
                Créer mon compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-[#aeaeb2] mt-5 flex items-center justify-center gap-1.5">
              <Shield className="h-3 w-3" />
              Données chiffrées · Conforme RGPD · Sans engagement
            </p>
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="border-t border-[#f5f5f7] bg-white">
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

