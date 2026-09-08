import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Link } from "react-router-dom";

import QABookLogo from "../../components/brand/QABookLogo";

import "./landing.css";

const lifecycle = [
  [
    "01",
    "Requirements",
    "Turn product intent into clear, traceable QA requirements.",
  ],
  [
    "02",
    "Scenarios",
    "Organize coverage around real user journeys and edge cases.",
  ],
  [
    "03",
    "Test Cases",
    "Create structured manual and automation-ready test cases.",
  ],
  [
    "04",
    "Execution",
    "Run suites, track results, and keep failures visible.",
  ],
  [
    "05",
    "Bugs",
    "Capture defects with execution context and retest history.",
  ],
];

const capabilities = [
  {
    eyebrow: "QUALITY PLANNING",
    title: "One workspace for the complete QA lifecycle.",
    text: "Keep requirements, scenarios, test cases, suites, runs, executions, bugs and reports connected instead of scattered across spreadsheets and tools.",
    visual: "lifecycle",
  },
  {
    eyebrow: "AUTOMATION",
    title: "Move from test case to automated execution.",
    text: "Map test cases to automation projects, generate Playwright-based tests, connect GitHub, and trigger CI execution from the same quality workflow.",
    visual: "automation",
  },
  {
    eyebrow: "INTELLIGENCE",
    title: "Use AI where QA teams spend the most time.",
    text: "Turn requirements into stronger scenarios and test coverage while keeping humans in control of what gets approved and executed.",
    visual: "ai",
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const items =
      ref.current.querySelectorAll<HTMLElement>("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return ref;
}

function ProductPreview() {
  const previewRef = useRef<HTMLDivElement | null>(null);

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>,
  ) {
    const element = previewRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
        rect.width -
      0.5;

    const y =
      (event.clientY - rect.top) /
        rect.height -
      0.5;

    element.style.setProperty(
      "--rx",
      `${-y * 5}deg`,
    );

    element.style.setProperty(
      "--ry",
      `${x * 7}deg`,
    );
  }

  function resetTilt() {
    const element = previewRef.current;

    if (!element) return;

    element.style.setProperty(
      "--rx",
      "0deg",
    );

    element.style.setProperty(
      "--ry",
      "0deg",
    );
  }

  return (
    <div className="hero-stage">
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <div
        ref={previewRef}
        className="product-preview"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className="preview-glow" />

        <div className="preview-window">
          <div className="window-topbar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>

            <span>
              QABook / Project overview
            </span>

            <div className="window-avatar">
              RG
            </div>
          </div>

          <div className="preview-body">
            <aside className="preview-sidebar">
              <div className="mini-logo">
                <span>Q</span>
                <b>QABook</b>
              </div>

              {[
                "Overview",
                "Requirements",
                "Scenarios",
                "Test Cases",
                "Automation",
                "Bugs",
              ].map((item, index) => (
                <div
                  className={`mini-nav ${
                    index === 0
                      ? "active"
                      : ""
                  }`}
                  key={item}
                >
                  <span className="mini-nav-dot" />
                  {item}
                </div>
              ))}
            </aside>

            <main className="preview-main">
              <div className="preview-heading">
                <div>
                  <small>
                    PROJECT / QA-STORE
                  </small>

                  <h3>
                    Quality overview
                  </h3>
                </div>

                <button type="button">
                  Run tests
                </button>
              </div>

              <div className="metric-grid">
                <div className="metric-card">
                  <small>
                    TEST CASES
                  </small>

                  <strong>128</strong>

                  <span className="positive">
                    ↑ 12% coverage
                  </span>
                </div>

                <div className="metric-card">
                  <small>
                    PASS RATE
                  </small>

                  <strong>
                    94.8%
                  </strong>

                  <span className="positive">
                    ↑ 3.2% this week
                  </span>
                </div>

                <div className="metric-card">
                  <small>
                    OPEN BUGS
                  </small>

                  <strong>07</strong>

                  <span className="warning">
                    3 need attention
                  </span>
                </div>
              </div>

              <div className="preview-lower">
                <div className="chart-card">
                  <div className="chart-title">
                    <div>
                      <small>
                        EXECUTION HEALTH
                      </small>

                      <strong>
                        Weekly test results
                      </strong>
                    </div>

                    <span>
                      Last 7 days
                    </span>
                  </div>

                  <div className="chart">
                    <div className="chart-grid">
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>

                    <svg
                      viewBox="0 0 500 150"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="areaGradient"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#55d8ff"
                            stopOpacity=".35"
                          />

                          <stop
                            offset="100%"
                            stopColor="#55d8ff"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      <path
                        className="chart-area"
                        d="M0 125 C40 112 55 118 85 96 S130 110 160 78 S205 88 235 68 S275 75 305 54 S345 66 370 42 S420 54 450 29 S480 38 500 18 L500 150 L0 150 Z"
                      />

                      <path
                        className="chart-line"
                        d="M0 125 C40 112 55 118 85 96 S130 110 160 78 S205 88 235 68 S275 75 305 54 S345 66 370 42 S420 54 450 29 S480 38 500 18"
                      />
                    </svg>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="chart-title">
                    <div>
                      <small>
                        LIVE ACTIVITY
                      </small>

                      <strong>
                        Latest execution
                      </strong>
                    </div>
                  </div>

                  {[
                    [
                      "TC-006",
                      "Checkout validation",
                      "Failed",
                    ],
                    [
                      "TC-005",
                      "Login happy path",
                      "Passed",
                    ],
                    [
                      "TC-004",
                      "Cart persistence",
                      "Passed",
                    ],
                  ].map(
                    ([id, name, status]) => (
                      <div
                        className="activity-row"
                        key={id}
                      >
                        <span
                          className={`status-dot ${
                            status ===
                            "Failed"
                              ? "failed"
                              : ""
                          }`}
                        />

                        <div>
                          <b>{id}</b>
                          <span>{name}</span>
                        </div>

                        <em
                          className={
                            status ===
                            "Failed"
                              ? "failed-text"
                              : ""
                          }
                        >
                          {status}
                        </em>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        <div className="floating-card floating-run">
          <span className="floating-icon play-icon">
            ▶
          </span>

          <div>
            <small>TEST RUN</small>
            <b>Smoke Suite</b>
          </div>

          <strong>94%</strong>
        </div>

        <div className="floating-card floating-ci">
          <span className="floating-icon ci-icon">
            ⌁
          </span>

          <div>
            <small>CI / GITHUB</small>
            <b>Pipeline passed</b>
          </div>

          <span className="live-pill">
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
}

function LifecycleVisual() {
  return (
    <div className="cap-visual lifecycle-visual">
      <div className="flow-line" />

      {lifecycle.map(
        ([number, title]) => (
          <div
            className="flow-step"
            key={number}
          >
            <span>{number}</span>

            <div>
              <b>{title}</b>
              <i />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className="cap-visual automation-visual">
      <div className="pipeline-line" />

      {[
        "QABook",
        "Playwright",
        "GitHub",
        "CI",
        "Execution",
      ].map((item, index) => (
        <div
          className="pipeline-node"
          key={item}
        >
          <div
            className={`pipeline-icon node-${index}`}
          >
            {index === 0
              ? "Q"
              : index === 1
                ? "◈"
                : index === 2
                  ? "⌘"
                  : index === 3
                    ? "↯"
                    : "✓"}
          </div>

          <b>{item}</b>

          {index < 4 && (
            <span className="pipeline-arrow">
              →
            </span>
          )}
        </div>
      ))}

      <div className="pipeline-pulse" />
    </div>
  );
}

function AiVisual() {
  return (
    <div className="cap-visual ai-visual">
      <div className="ai-core">
        <div className="ai-ring ring-one" />
        <div className="ai-ring ring-two" />

        <div className="ai-core-center">
          AI
        </div>
      </div>

      <div className="ai-chip chip-one">
        Requirement → Scenario
      </div>

      <div className="ai-chip chip-two">
        Coverage suggestions
      </div>

      <div className="ai-chip chip-three">
        Edge-case discovery
      </div>

      <div className="ai-particle particle-one" />
      <div className="ai-particle particle-two" />
      <div className="ai-particle particle-three" />
    </div>
  );
}

export default function LandingPage() {
  const pageRef = useReveal();

  const [scrolled, setScrolled] =
    useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(
        window.scrollY > 20,
      );

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll,
      );
  }, []);

  return (
    <div
      ref={pageRef}
      className="landing-page"
    >
      <header
        className={`landing-nav ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <div className="nav-inner">
          <Link
            className="brand"
            to="/"
            aria-label="QABook home"
          >
            <QABookLogo
              size="md"
            />
          </Link>

          <nav
            className="desktop-nav"
            aria-label="Primary navigation"
          >
            <a href="#platform">
              Platform
            </a>

            <a href="#automation">
              Automation
            </a>

            <a href="#intelligence">
              AI
            </a>

            <a href="#workflow">
              Workflow
            </a>
          </nav>

          <div className="nav-actions">
            <Link
              className="nav-login"
              to="/login"
            >
              Sign in
            </Link>

            <Link
              className="nav-cta"
              to="/login"
            >
              Get started{" "}
              <span>↗</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid" />

          <div className="hero-content">
            <div className="eyebrow hero-eyebrow">
              <span className="eyebrow-pulse" />
              AI POWERED QA WORKSPACE
            </div>

            <h1>
              Test smarter.
              <span>
                Deliver better.
              </span>
            </h1>

            <p>
              Plan, manage, automate,
              and track your testing in
              one powerful workspace
              built for modern QA teams.
            </p>

            <div className="hero-actions">
              <Link
                className="primary-button"
                to="/login"
              >
                Start building quality{" "}
                <span>→</span>
              </Link>

              <a
                className="secondary-button"
                href="#platform"
              >
                Explore platform{" "}
                <span>↓</span>
              </a>
            </div>

            <div className="hero-points">
              <span>
                <i>✓</i>
                Complete QA lifecycle
              </span>

              <span>
                <i>✓</i>
                Playwright automation
              </span>

              <span>
                <i>✓</i>
                GitHub &amp; CI/CD
              </span>
            </div>
          </div>

          <ProductPreview />
        </section>

        <section
          id="platform"
          className="intro-section"
        >
          <div
            className="section-kicker"
            data-reveal
          >
            THE QA WORKSPACE
          </div>

          <h2 data-reveal>
            From requirement to
            <span>
              {" "}
              release confidence.
            </span>
          </h2>

          <p data-reveal>
            QABook connects the work
            QA teams already do into one
            traceable, execution-focused
            system.
          </p>
        </section>

        <section
          id="workflow"
          className="capabilities-section"
        >
          {capabilities.map(
            (capability, index) => (
              <article
                className={`capability capability-${
                  index + 1
                }`}
                key={capability.title}
              >
                <div
                  className="capability-copy"
                  data-reveal
                >
                  <div className="section-kicker">
                    {capability.eyebrow}
                  </div>

                  <h3>
                    {capability.title}
                  </h3>

                  <p>
                    {capability.text}
                  </p>

                  <span className="capability-link">
                    Explore capability{" "}
                    <b>→</b>
                  </span>
                </div>

                <div
                  className="capability-stage"
                  data-reveal
                >
                  {capability.visual ===
                    "lifecycle" && (
                    <LifecycleVisual />
                  )}

                  {capability.visual ===
                    "automation" && (
                    <AutomationVisual />
                  )}

                  {capability.visual ===
                    "ai" && (
                    <AiVisual />
                  )}
                </div>
              </article>
            ),
          )}
        </section>

        <section
          id="automation"
          className="automation-banner"
        >
          <div className="automation-background" />

          <div
            className="automation-copy"
            data-reveal
          >
            <div className="section-kicker">
              AUTOMATION + CI/CD
            </div>

            <h2>
              Keep automation close
              to the test workflow.
            </h2>

            <p>
              Generate automation-ready
              tests, connect repositories,
              trigger execution, and bring
              results back into QABook.
            </p>

            <Link
              className="primary-button"
              to="/login"
            >
              Open QABook{" "}
              <span>↗</span>
            </Link>
          </div>

          <div
            className="automation-orbit"
            data-reveal
          >
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />

            <div className="orbit-center">
              <span>Q</span>
              <b>Automation</b>
            </div>

            <div className="orbit-badge badge-a">
              Playwright
            </div>

            <div className="orbit-badge badge-b">
              GitHub
            </div>

            <div className="orbit-badge badge-c">
              pytest
            </div>

            <div className="orbit-badge badge-d">
              CI/CD
            </div>
          </div>
        </section>

        <section
          id="intelligence"
          className="ai-section"
        >
          <div
            className="ai-heading"
            data-reveal
          >
            <div className="section-kicker">
              INTELLIGENT QA
            </div>

            <h2>
              AI that assists the
              process, not replaces
              the tester.
            </h2>

            <p>
              Generate useful starting
              points, strengthen coverage,
              and spend more time on
              decisions that require human
              judgment.
            </p>
          </div>

          <div
            className="ai-flow"
            data-reveal
          >
            <div className="ai-flow-card">
              <small>INPUT</small>

              <strong>
                Requirement
              </strong>

              <span>
                “Customer can reset
                password”
              </span>
            </div>

            <div className="ai-flow-arrow">
              →
            </div>

            <div className="ai-flow-card featured">
              <small>AI ASSIST</small>

              <strong>
                Coverage ideas
              </strong>

              <span>
                Happy path · invalid
                token · expiry · security
              </span>
            </div>

            <div className="ai-flow-arrow">
              →
            </div>

            <div className="ai-flow-card">
              <small>OUTPUT</small>

              <strong>
                QA scenarios
              </strong>

              <span>
                Structured, reviewable,
                traceable
              </span>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-glow" />

          <div
            className="section-kicker"
            data-reveal
          >
            READY WHEN YOU ARE
          </div>

          <h2 data-reveal>
            Build a better QA
            workflow.
          </h2>

          <p data-reveal>
            Bring planning, execution,
            automation, and quality
            visibility into one place.
          </p>

          <Link
            className="primary-button large"
            to="/login"
            data-reveal
          >
            Enter QABook{" "}
            <span>→</span>
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-inner">
          <Link
            className="brand"
            to="/"
            aria-label="QABook home"
          >
            <QABookLogo
              size="sm"
            />
          </Link>

          <span>
            AI Powered QA Workspace
          </span>

          <span>
            © {new Date().getFullYear()}{" "}
            QABook
          </span>
        </div>
      </footer>
    </div>
  );
}