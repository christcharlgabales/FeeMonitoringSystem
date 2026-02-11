<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useTheme } from 'vuetify'

interface Props {
  data: {
    title: string
    subtitle: string
    description: string
  }
}

defineProps<Props>()

const theme = useTheme()
const isVisible = ref(false)

const isDark = computed(() => theme.global.current.value.dark)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

function scrollToFeatures() {
  const element = document.querySelector('#features')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

function navigateToAuth() {
  window.location.href = '/auth'
}
</script>

<template>
  <section class="hero-section" :class="{ 'dark-mode': isDark }">
    <div class="hero-background">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
      <div class="background-shape shape-3"></div>
      <div class="gradient-overlay"></div>
    </div>

    <v-container class="hero-container">
      <v-row align="center" class="min-height-screen" justify="center">
        <v-col cols="12" lg="10" md="11">
          <div class="hero-content" :class="{ 'is-visible': isVisible }">
            <!-- Logo/Icon -->
            <div class="hero-icon">
              <div class="icon-glow"></div>
              <v-icon 
                icon="mdi-bus-multiple" 
                size="80"
                :color="isDark ? '#F4E4BC' : 'primary'"
                class="main-icon"
              />
            </div>

            <!-- Main Title -->
            <h1 class="hero-title">
              {{ data.title }}
            </h1>

            <!-- Subtitle -->
            <h2 class="hero-subtitle">
              {{ data.subtitle }}
            </h2>

            <!-- Description -->
            <p class="hero-description">
              {{ data.description }}
            </p>

            <!-- CTA Buttons -->
            <div class="hero-actions">
              <v-btn
                class="cta-button primary-btn"
                :color="isDark ? '#F4E4BC' : 'primary'"
                size="x-large"
                variant="elevated"
                @click="navigateToAuth"
              >
                <v-icon class="me-2" icon="mdi-login" />
                Get Started
              </v-btn>

              <v-btn
                class="cta-button secondary-btn"
                :color="isDark ? '#F4E4BC' : 'primary'"
                size="x-large"
                variant="outlined"
                @click="scrollToFeatures"
              >
                <v-icon class="me-2" icon="mdi-arrow-down-circle" />
                Learn More
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
/* Light Mode Styles */
.hero-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8f4ec 50%, #f0e8d8 100%);
  padding: 2rem 0;
  transition: background 0.3s ease;
}

/* Dark Mode Styles */
.hero-section.dark-mode {
  background: linear-gradient(135deg, #1a1410 0%, #2c1f16 50%, #3d2a1c 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(139, 69, 19, 0.1) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dark-mode .gradient-overlay {
  opacity: 1;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(244, 228, 188, 0.08) 0%,
    transparent 50%
  );
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  animation: float 20s infinite ease-in-out;
  transition: all 0.3s ease;
}

.dark-mode .background-shape {
  opacity: 0.12;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #8B4513;
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.dark-mode .shape-1 {
  background: #F4E4BC;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #F4E4BC;
  bottom: -150px;
  left: -100px;
  animation-delay: 5s;
}

.dark-mode .shape-2 {
  background: #8B4513;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: #8B4513;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

.dark-mode .shape-3 {
  background: #D2691E;
}

.hero-container {
  position: relative;
  z-index: 1;
}

.min-height-screen {
  min-height: calc(100vh - 64px);
  padding: 3rem 0;
}

.hero-content {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-content.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-icon {
  margin-bottom: 2rem;
  animation: bounceIn 1s ease-out 0.3s both;
  position: relative;
  display: inline-block;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    rgba(139, 69, 19, 0.2) 0%,
    transparent 70%
  );
  border-radius: 50%;
  animation: pulse-glow 3s infinite;
  transition: all 0.3s ease;
}

.dark-mode .icon-glow {
  background: radial-gradient(
    circle,
    rgba(244, 228, 188, 0.3) 0%,
    transparent 70%
  );
}

.main-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

.dark-mode .main-icon {
  filter: drop-shadow(0 4px 12px rgba(244, 228, 188, 0.3));
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #2c1810;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  animation: slideUp 0.8s ease-out 0.5s both;
  transition: color 0.3s ease;
}

.dark-mode .hero-title {
  color: #F4E4BC;
  text-shadow: 0 2px 20px rgba(244, 228, 188, 0.2);
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 600;
  color: #8B4513;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  animation: slideUp 0.8s ease-out 0.7s both;
  transition: color 0.3s ease;
}

.dark-mode .hero-subtitle {
  color: #D2B48C;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #5a4a3a;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.7;
  animation: slideUp 0.8s ease-out 0.9s both;
  transition: color 0.3s ease;
}

.dark-mode .hero-description {
  color: #C9B899;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
  animation: slideUp 0.8s ease-out 1.1s both;
}

.cta-button {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
}

.dark-mode .cta-button {
  box-shadow: 0 4px 16px rgba(244, 228, 188, 0.15);
}

.primary-btn {
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
}

.dark-mode .primary-btn {
  background: linear-gradient(135deg, #F4E4BC 0%, #E6D5A8 100%);
  color: #2c1810 !important;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.3);
}

.dark-mode .primary-btn:hover {
  box-shadow: 0 8px 24px rgba(244, 228, 188, 0.3);
}

.secondary-btn {
  border-width: 2px;
}

.secondary-btn:hover {
  transform: translateY(-2px);
  background: rgba(139, 69, 19, 0.05);
}

.dark-mode .secondary-btn:hover {
  background: rgba(244, 228, 188, 0.1);
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.4;
  }
}

/* Responsive */
@media (max-width: 960px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .cta-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 600px) {
  .hero-icon {
    margin-bottom: 1.5rem;
  }

  .hero-section {
    padding: 1rem 0;
  }

  .min-height-screen {
    padding: 2rem 0;
  }
}
</style>