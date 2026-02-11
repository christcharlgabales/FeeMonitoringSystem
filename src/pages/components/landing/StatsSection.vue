<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const stats = [
  {
    icon: 'mdi-account-group',
    value: 5000,
    suffix: '+',
    label: 'Active Members',
    color: '#8B4513',
  },
  {
    icon: 'mdi-bus',
    value: 150,
    suffix: '+',
    label: 'Vehicles',
    color: '#D2691E',
  },
  {
    icon: 'mdi-map-marker-path',
    value: 50,
    suffix: '+',
    label: 'Routes Covered',
    color: '#A0522D',
  },
  {
    icon: 'mdi-star',
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    color: '#CD853F',
  },
]

const animatedValues = ref(stats.map(() => 0))
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          animateNumbers()
        }
      })
    },
    { threshold: 0.2 }
  )

  const section = document.querySelector('.stats-section')
  if (section) {
    observer.observe(section)
  }
})

function animateNumbers() {
  stats.forEach((stat, index) => {
    const duration = 2000
    const steps = 60
    const increment = stat.value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= stat.value) {
        animatedValues.value[index] = stat.value
        clearInterval(timer)
      } else {
        animatedValues.value[index] = Math.floor(current)
      }
    }, duration / steps)
  })
}
</script>

<template>
  <section class="stats-section">
    <v-container>
      <div class="stats-wrapper" :class="{ 'is-visible': isVisible }">
        <v-row justify="center">
          <v-col
            v-for="(stat, index) in stats"
            :key="index"
            cols="6"
            sm="6"
            md="3"
          >
            <div class="stat-card" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="stat-icon-wrapper">
                <v-icon
                  :icon="stat.icon"
                  :color="stat.color"
                  size="48"
                  class="stat-icon"
                />
              </div>
              <div class="stat-value">
                {{ animatedValues[index] }}{{ stat.suffix }}
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
.stats-section {
  padding: 4rem 0;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 69, 19, 0.2) 50%,
    transparent 100%
  );
}

.stats-wrapper {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-wrapper.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-card {
  text-align: center;
  padding: 2rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
  animation: slideUpFade 0.6s ease-out forwards;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(139, 69, 19, 0.15);
  border-color: rgba(139, 69, 19, 0.3);
}

.stat-icon-wrapper {
  margin-bottom: 1rem;
  display: inline-flex;
  padding: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(244, 228, 188, 0.2) 100%);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

.stat-icon {
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

.stat-value {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #2c1810;
  margin-bottom: 0.5rem;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 600;
  color: #8B4513;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 960px) {
  .stats-section {
    padding: 3rem 0;
  }

  .stat-card {
    padding: 1.5rem 0.75rem;
  }

  .stat-icon-wrapper {
    padding: 0.75rem;
  }
}

@media (max-width: 600px) {
  .stat-card {
    margin-bottom: 1rem;
  }
}
</style>