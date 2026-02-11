<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Props {
  data: {
    version: string
    author: string
    lastUpdated: string
  }
}

defineProps<Props>()

const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    },
    { threshold: 0.2 }
  )

  const section = document.querySelector('#about')
  if (section) {
    observer.observe(section)
  }
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function navigateToAuth() {
  window.location.href = '/auth'
}
</script>

<template>
  <section id="about" class="about-section">
    <div class="about-background">
      <div class="grid-pattern"></div>
    </div>

    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" md="10" lg="8">
          <div class="about-content" :class="{ 'is-visible': isVisible }">
            <!-- Main CTA Card -->
            <div class="cta-card">
              <div class="cta-icon">
                <v-icon icon="mdi-rocket-launch" size="64" color="primary" />
              </div>

              <h2 class="cta-title">
                Ready to Get Started?
              </h2>

              <p class="cta-description">
                Join thousands of satisfied users managing their fees efficiently with our comprehensive system. 
                Start your journey towards streamlined fee management today.
              </p>

              <v-btn
                size="x-large"
                color="primary"
                variant="elevated"
                class="cta-button"
                @click="navigateToAuth"
              >
                <v-icon class="me-2" icon="mdi-login" />
                Access System
              </v-btn>

              <!-- System Info -->
              <div class="system-info">
                <div class="info-divider"></div>
                
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Version</div>
                    <div class="info-value">{{ data.version }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">Developed By</div>
                    <div class="info-value">{{ data.author }}</div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">Last Updated</div>
                    <div class="info-value">{{ formatDate(data.lastUpdated) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature Highlights -->
            <div class="highlights-grid">
              <div class="highlight-item">
                <v-icon icon="mdi-shield-check-outline" size="32" color="success" />
                <div class="highlight-text">
                  <h4>Secure & Reliable</h4>
                  <p>Bank-level security for your data</p>
                </div>
              </div>

              <div class="highlight-item">
                <v-icon icon="mdi-clock-fast" size="32" color="primary" />
                <div class="highlight-text">
                  <h4>Real-time Updates</h4>
                  <p>Instant synchronization across devices</p>
                </div>
              </div>

              <div class="highlight-item">
                <v-icon icon="mdi-headset" size="32" color="info" />
                <div class="highlight-text">
                  <h4>24/7 Support</h4>
                  <p>Always here to help you succeed</p>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
.about-section {
  padding: 6rem 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8f4ec 100%);
  position: relative;
  overflow: hidden;
}

.about-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

.grid-pattern {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(139, 69, 19, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 69, 19, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.about-content {
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.about-content.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 4rem 3rem;
  text-align: center;
  border: 1px solid rgba(139, 69, 19, 0.1);
  box-shadow: 0 20px 60px rgba(139, 69, 19, 0.1);
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
}

.cta-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8B4513 0%, #D2691E 50%, #8B4513 100%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}

.cta-icon {
  margin-bottom: 2rem;
  animation: pulse 2s infinite;
}

.cta-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #2c1810;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.cta-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #5a4a3a;
  max-width: 600px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
}

.cta-button {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 1.5rem 3rem !important;
  font-size: 1.125rem;
  box-shadow: 0 8px 24px rgba(139, 69, 19, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(139, 69, 19, 0.35);
}

.system-info {
  margin-top: 3rem;
}

.info-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #8B4513 0%, #D2691E 100%);
  margin: 0 auto 2rem;
  border-radius: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  max-width: 700px;
  margin: 0 auto;
}

.info-item {
  text-align: center;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #8B4513;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1rem;
  font-weight: 700;
  color: #2c1810;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.highlight-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.2);
}

.highlight-text h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 0.25rem;
}

.highlight-text p {
  font-size: 0.9375rem;
  color: #5a4a3a;
  margin: 0;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 960px) {
  .about-section {
    padding: 4rem 0;
  }

  .cta-card {
    padding: 3rem 2rem;
  }

  .info-grid {
    gap: 1.5rem;
  }

  .highlights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .about-section {
    padding: 3rem 0;
  }

  .cta-card {
    padding: 2.5rem 1.5rem;
  }

  .cta-button {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .highlight-item {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
}
</style>