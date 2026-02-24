import React from 'react';
import Layout from '@theme/Layout';
import styles from './brand.module.css';

export default function BrandGuide() {
  return (
    <Layout
      title="Brand Guide"
      description="WorkFort brand guidelines"
      noIndex={true}>
      <main className={styles.brandGuide}>
        <div className="container">
          <h1>WorkFort Brand Guide</h1>
          <p className={styles.intro}>
            Visual identity and design guidelines for WorkFort — infrastructure for AI agents.
          </p>

          {/* Colors */}
          <section className={styles.section}>
            <h2>Colors</h2>
            <div className={styles.colorGrid}>
              <div className={styles.colorCard}>
                <div className={styles.colorSwatch} style={{background: '#00f0ff'}}></div>
                <div className={styles.colorInfo}>
                  <h3>Cyan</h3>
                  <code>#00f0ff</code>
                  <p>Primary brand color. Used for links, highlights, and key UI elements.</p>
                </div>
              </div>

              <div className={styles.colorCard}>
                <div className={styles.colorSwatch} style={{background: '#bf00ff'}}></div>
                <div className={styles.colorInfo}>
                  <h3>Magenta</h3>
                  <code>#bf00ff</code>
                  <p>Accent color. Used for CTAs, important highlights, and visual emphasis.</p>
                </div>
              </div>

              <div className={styles.colorCard}>
                <div className={styles.colorSwatch} style={{background: '#39ff14'}}></div>
                <div className={styles.colorInfo}>
                  <h3>Green</h3>
                  <code>#39ff14</code>
                  <p>Terminal/success color. Used for code, terminal output, and success states.</p>
                </div>
              </div>

              <div className={styles.colorCard}>
                <div className={styles.colorSwatch} style={{background: '#000000'}}></div>
                <div className={styles.colorInfo}>
                  <h3>Black</h3>
                  <code>#000000</code>
                  <p>Background color. Pure black for maximum contrast and cyberpunk aesthetic.</p>
                </div>
              </div>

              <div className={styles.colorCard}>
                <div className={styles.colorSwatch} style={{background: '#ffffff'}}></div>
                <div className={styles.colorInfo}>
                  <h3>White</h3>
                  <code>#ffffff</code>
                  <p>Primary text color. High contrast on black backgrounds.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Brand Assets */}
          <section className={styles.section}>
            <h2>Brand Assets</h2>
            <div className={styles.brandAssets}>
              <div className={styles.assetCard}>
                <h3>Domain</h3>
                <code>workfort.dev</code>
              </div>
              <div className={styles.assetCard}>
                <h3>X (Twitter) Handle</h3>
                <code>@WorkFortHQ</code>
              </div>
              <div className={styles.assetCard}>
                <h3>Contact Email</h3>
                <code>social@workfort.dev</code>
              </div>
              <div className={styles.assetCard}>
                <h3>GitHub Organization</h3>
                <code>Work-Fort</code>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section className={styles.section}>
            <h2>Typography</h2>
            <div className={styles.typeGrid}>
              <div className={styles.typeCard}>
                <h3>Body Font</h3>
                <p style={{fontFamily: 'Inter, sans-serif', fontSize: '1.5rem'}}>Inter</p>
                <p>Used for all body text, UI elements, and general content.</p>
              </div>
              <div className={styles.typeCard}>
                <h3>Monospace Font</h3>
                <p style={{fontFamily: 'LiterationMono Nerd Font, monospace', fontSize: '1.5rem'}}>LiterationMono Nerd Font</p>
                <p>Used for code, terminal output, and technical content.</p>
              </div>
            </div>
          </section>

          {/* Aesthetic */}
          <section className={styles.section}>
            <h2>Visual Aesthetic</h2>
            <div className={styles.aestheticGrid}>
              <div className={styles.aestheticCard}>
                <h3>Tron Legacy + Cyberpunk</h3>
                <p>Clean geometric shapes, neon glows, grid patterns. Think: digital, precise, technical.</p>
              </div>
              <div className={styles.aestheticCard}>
                <h3>Neon Glow Effects</h3>
                <p>Cyan and magenta glows on interactive elements. Subtle, not overwhelming.</p>
              </div>
              <div className={styles.aestheticCard}>
                <h3>Angular Geometry</h3>
                <p>Clipped corners (clip-path), diagonal lines, grid backgrounds. No rounded corners.</p>
              </div>
              <div className={styles.aestheticCard}>
                <h3>Minimal Ornament</h3>
                <p>Function over decoration. Every visual element serves a purpose.</p>
              </div>
            </div>
          </section>

          {/* Tone */}
          <section className={styles.section}>
            <h2>Voice & Tone</h2>
            <div className={styles.toneContent}>
              <h3>Direct & Technical</h3>
              <p>We don't hedge. "Firecracker microVMs, not containers." Clear, specific, opinionated.</p>

              <h3>Build in Public</h3>
              <p>Show the work. Day-by-day devlogs, technical decisions, what broke and why.</p>

              <h3>No Marketing Fluff</h3>
              <p>Avoid buzzwords, hype, and vague promises. Facts, benchmarks, and tradeoffs.</p>

              <h3>For Builders</h3>
              <p>Audience is developers and AI researchers. Assume technical literacy.</p>

              <h3>Carbon & Silicon</h3>
              <p>Humans are carbon-based team members. AIs are silicon-based team members. Not "users and tools" — teammates with different substrates. This language reinforces that WorkFort is an organization where AIs and humans collaborate as peers, not a product where humans use AI as a feature.</p>
            </div>
          </section>

          {/* Usage Examples */}
          <section className={styles.section}>
            <h2>Design Patterns</h2>
            <div className={styles.patternGrid}>
              <div className={styles.pattern}>
                <h3>Buttons</h3>
                <button className="button button--primary">Primary (Magenta)</button>
                <button className="button button--secondary">Secondary (Cyan Outline)</button>
              </div>

              <div className={styles.pattern}>
                <h3>Links</h3>
                <p><a href="#">Cyan links</a> with cyan glow on hover</p>
              </div>

              <div className={styles.pattern}>
                <h3>Code</h3>
                <pre style={{background: '#0a0a0a', padding: '1rem', border: '1px solid #222'}}>
                  <code style={{color: '#39ff14'}}>pacman -S workfort</code>
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
