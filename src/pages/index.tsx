import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTagline}>
            AI agents already have <span
              className="neon-cyan glitch"
              data-text="chat"
              data-glitch-effect="true"
              data-glitch-speed="20"
              data-glitch-rounds="0.556"
              data-glitch-scanline-trigger="true"
            >chat</span> and <span
              className="neon-cyan glitch"
              data-text="tools"
              data-glitch-effect="true"
              data-glitch-speed="20"
              data-glitch-rounds="0.556"
              data-glitch-frequency="1667"
              data-glitch-probability="0.3"
            >tools</span>, they need a <span className="neon-cyan">computer</span>.
          </h1>

          <p className={styles.heroSubtitle}>
            A daemon that gives AI agents isolated workspaces with full system access.
            Firecracker microVMs, not containers. Pacman install on Arch.
          </p>

          <div className={styles.heroButtons}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Get Started
            </Link>
            <Link className="button button--secondary button--lg" to="/blog">
              Read the Blog
            </Link>
          </div>
        </div>

        <div className={styles.heroTerminal}>
          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <div className="terminal-body" data-terminal>
              {/* Terminal content will be typed by JS */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreePillars() {
  return (
    <>
      <div className="circuit-line"></div>

      <section className={styles.section}>
        <div className="container">
          <header className={styles.sectionHeader}>
            <h2 className="neon-cyan">Built for AI Agents</h2>
            <p className={styles.sectionSubtitle}>Three pillars that make WorkFort different</p>
          </header>

          <div className={styles.pillarsGrid}>
            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="card-title">Hardware-level Isolation</h3>
              <p className="card-text">
                Firecracker microVMs, not containers. Each agent gets its own kernel,
                its own filesystem, its own network stack. True isolation that containers
                can't match.
              </p>
            </article>

            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              <h3 className="card-title">Persistent Workspaces</h3>
              <p className="card-text">
                btrfs snapshots for instant rollback. Save VM state, restore later.
                Your agent's work persists across reboots, deployments, and migrations.
              </p>
            </article>

            <article className="card">
              <div className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <h3 className="card-title">Self-hostable</h3>
              <p className="card-text">
                pacman install on Arch Linux. Static Rust binary, portable across distros.
                No cloud lock-in, no vendor dependencies. Your infrastructure, your control.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

function QuickInstall() {
  return (
    <>
      <div className="circuit-line"></div>

      <section className={styles.section}>
        <div className="container" style={{maxWidth: '800px'}}>
          <header className={styles.sectionHeader}>
            <h2 className="neon-cyan">Quick Install</h2>
            <p className={styles.sectionSubtitle}>Get started in seconds</p>
          </header>

          <div className="terminal" style={{marginBottom: '1.5rem'}}>
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command">pacman -S nexus</span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command">systemctl --user start nexus</span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command">nexusctl vm create agent-vm</span>
              </div>
            </div>
          </div>

          <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem'}}>
            Nexus daemon + CLI. Static Rust binary, portable across distros.{' '}
            <Link to="/docs/intro">View docs →</Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A daemon that gives AI agents isolated workspaces with full system access via Firecracker microVMs."
      wrapperClassName="homepage">
      <main>
        <HomepageHero />
        <ThreePillars />
        <QuickInstall />
      </main>
    </Layout>
  );
}
