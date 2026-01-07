# 🎮 Sistema de Power-ups - Super Pang

## 📦 Spritesheet Bonus

**Ubicación**: `assets/sprites/static/bonus.png`
**Dimensiones**: 180x20 píxeles (9 frames de 20x20)

### Frames del Spritesheet

| Frame | Item | Descripción | Duración/Efecto |
|-------|------|-------------|-----------------|
| 0 | Arpón Doble | Cambia arma a doble arpón temporalmente | 15 segundos |
| 1 | Machine Gun | Cambia arma a ametralladora temporalmente | 15 segundos |
| 2 | Arpón Fijo | Cambia arma a arpón fijo temporalmente | 15 segundos |
| 3 | Escudo | Protege del próximo golpe | Hasta 30s o 1 hit |
| 4-5 | Bomba | Limpia la pantalla dañando todas las bolas | Instantáneo |
| 6 | Reloj | Congela el tiempo (para todas las bolas) | 10 segundos |
| 7 | Reloj de Arena | Ralentiza las bolas al 40% velocidad | 12 segundos |
| 8 | Vida Extra | Añade una vida extra | Permanente |

---

## 🔫 Armas Temporales

### WeaponTempDouble (Frame 0)
- **Clase**: `WeaponTempDouble.js`
- **Color**: Verde (#00FF88)
- **Efecto**: Permite disparar 2 arpones simultáneos
- **Duración**: 15 segundos
- **Tecla manual**: 1 (permanente) vs Item (temporal)

### WeaponTempMachine (Frame 1)
- **Clase**: `WeaponTempMachine.js`
- **Color**: Naranja/Rojo (#FF6600)
- **Efecto**: Disparo en abanico de 5 balas
- **Duración**: 15 segundos
- **Tecla manual**: 2 (permanente) vs Item (temporal)

### WeaponTempFixed (Frame 2)
- **Clase**: `WeaponTempFixed.js`
- **Color**: Púrpura (#AA00FF)
- **Efecto**: Arpón que se pega a la pared
- **Duración**: 15 segundos
- **Tecla manual**: 3 (permanente) vs Item (temporal)

#### Comportamiento
1. Al recoger un arma temporal, guarda el arma actual
2. Cambia al arma temporal
3. Tras 15 segundos, vuelve al arma original
4. Si se recoge otro arma temporal, reinicia el timer

---

## 🛡️ Escudo (Frame 3)

### PowerUpShield
- **Clase**: `PowerUpShield.js`
- **Color**: Cyan (#00FFFF)
- **Efecto**: Protección de un solo golpe

#### Mecánica del Escudo
1. **Activación**: Dura hasta 30 segundos si no recibes daño
2. **Protección**: Absorbe el PRIMER golpe completamente (no pierdes vida)
3. **Ruptura**: 
   - Efecto visual de "SHIELD BREAK!" en amarillo
   - Partículas cyan dispersándose
   - Concede 1 segundo de invulnerabilidad adicional
4. **Indicador Visual**:
   - Héroe con tinte cyan pulsante mientras está activo
   - Parpadeo amarillo al romperse (1 segundo)

---

## 💣 Bomba (Frames 4-5)

### PowerUpBomb
- **Clase**: `PowerUpBomb.js`
- **Color**: Rojo (#FF4444)
- **Efecto**: Clear de pantalla táctico

#### Mecánica de la Bomba
- **NO es como la bola especial**: Las bolas se dividen normalmente
- Daña TODAS las bolas en pantalla una vez
- Efecto visual:
  - Círculo expansivo naranja
  - 12 partículas de explosión
  - Shake de cámara
- Delay entre bolas: 0-200ms (efecto cascada)

#### Diferencia con Bola Estrella
| Aspecto | Bomba | Bola Estrella |
|---------|-------|---------------|
| División | ✅ SÍ se dividen | ❌ NO se dividen |
| Daño | 1 hit a todas | Destrucción total |
| Uso táctico | Controlar cantidad | Limpieza rápida |

---

## ⏱️ Efectos de Tiempo

### PowerUpTimeFreeze (Frame 6) - Reloj
- **Clase**: `PowerUpTimeFreeze.js`
- **Color**: Cyan (#00CCFF)
- **Duración**: 10 segundos

#### Mecánica
- Congela TODAS las bolas en su posición actual
- Guarda velocidad y gravedad original
- Efectos:
  - Velocidad → 0
  - Gravedad → 0
  - Tinte cyan en las bolas
- Flash de cámara blanco al activar
- Texto grande "TIME FREEZE!" en pantalla

### PowerUpTimeSlow (Frame 7) - Reloj de Arena
- **Clase**: `PowerUpTimeSlow.js`
- **Color**: Amarillo/Naranja (#FFCC00)
- **Duración**: 12 segundos

#### Mecánica
- Reduce velocidad de bolas al 40% (60% más lentas)
- Efectos:
  - Multiplica velocidades por 0.4
  - Tinte naranja en las bolas
  - Overlay amarillo semi-transparente en pantalla
- Texto "SLOW MOTION!" al activar

---

## ❤️ Vida Extra (Frame 8)

### PowerUpLife
- **Clase**: `PowerUpLife.js`
- **Efecto**: +1 vida
- **Drop Rate**: 1% (muy raro)

#### Sistema de Vidas en HUD
```
Vidas actuales → Visualización
1 vida        → 0 iconos
2 vidas       → 1 icono
3 vidas       → 2 iconos
4 vidas       → 2 iconos + "x3"
5 vidas       → 2 iconos + "x4"
...
```

**Lógica**: Siempre muestra máximo 2 iconos, el excedente se muestra como multiplicador

---

## 🎯 Sistema Dropper

### Configuración
```javascript
{
  dropChance: 0.5,  // 50% probabilidad base
  maxItems: 8       // Máximo 8 items en pantalla
}
```

### Tabla de Loot (128 weight units)

| Categoría | Items | Peso Total | % Aprox |
|-----------|-------|------------|---------|
| **Frutas (Puntuación)** | Small/Medium/Large/Special | 85 | 66% |
| **Armas Temp** | Double/Machine/Fixed | 18 | 14% |
| **Power-ups** | Speed/Shield/Bomb/Time/Life | 25 | 20% |

#### Distribución Detallada
- 🍎 Fruit Small (100): 40 weight (31%)
- 🍎 Fruit Medium (250): 25 weight (20%)
- 🍎 Fruit Large (500): 15 weight (12%)
- 🍎 Fruit Special (1000): 5 weight (4%)
- 🔫 Double Harpoon: 7 weight (5%)
- 🔫 Machine Gun: 6 weight (5%)
- 🔫 Fixed Harpoon: 5 weight (4%)
- ⚡ Speed: 8 weight (6%)
- 🛡️ Shield: 6 weight (5%)
- 💣 Bomb: 4 weight (3%)
- ⏱️ Time Freeze: 3 weight (2%)
- ⏱️ Time Slow: 3 weight (2%)
- ❤️ Extra Life: 1 weight (0.8%)

---

## 🎨 Implementación en Código

### Estructura de Carpetas
```
src/entities/items/
├── BaseItem.js          # Clase base para todos los items
├── Dropper.js           # Sistema de drop manager
├── Fruits.js            # Items de puntuación (frutas)
└── powerups/            # Carpeta de power-ups
    ├── PowerUpLife.js
    ├── PowerUpShield.js
    ├── PowerUpSpeed.js
    ├── PowerUpWeapon.js
    ├── PowerUpBomb.js
    ├── PowerUpTimeFreeze.js
    ├── PowerUpTimeSlow.js
    ├── WeaponTempDouble.js
    ├── WeaponTempMachine.js
    └── WeaponTempFixed.js
```

### Cargar en preload()
```javascript
this.load.setPath("assets/sprites/static");
this.load.spritesheet("bonus", "bonus.png", {
  frameWidth: 20,
  frameHeight: 20
});
```

### Inicializar Dropper en create()
```javascript
import { Dropper } from "../entities/items/Dropper.js";

this.dropper = new Dropper(this, {
  dropChance: 0.5,
  maxItems: 8
});
```

### Dropear Items
```javascript
// Al destruir una bola
onWeaponHitsBall(weapon, ball) {
  if (this.dropper) {
    this.dropper.dropFrom(ball, ball.x, ball.y);
  }
  ball.takeDamage();
}
```

### Recoger Items (en update())
```javascript
if (this.dropper && this.dropper.activeItems) {
  this.dropper.activeItems.forEach(item => {
    if (item && item.active && !item.consumed) {
      item.checkPickup(this.hero);
    }
  });
}
```

---

## 📋 Constantes Importantes

### En constants.js
```javascript
export const ITEMS = {
  TTL: {
    WEAPON_TEMP_DOUBLE: 7000,
    WEAPON_TEMP_MACHINE: 7000,
    WEAPON_TEMP_FIXED: 7000,
    BOMB: 9000,
    TIME_FREEZE: 8000,
    TIME_SLOW: 8000
  },
  
  DURATION: {
    SHIELD: 30000,
    SHIELD_INVULN_AFTER_BREAK: 1000,
    WEAPON_TEMP: 15000,
    TIME_FREEZE: 10000,
    TIME_SLOW: 12000
  },
  
  MULTIPLIER: {
    SLOW_MOTION: 0.4
  }
};
```

---

## 🐛 Debugging

### Forzar Drop Específico
```javascript
// En consola del navegador o código
this.dropper.dropFrom(null, 400, 300, { 
  itemType: 'POWER_UP_BOMB',
  guaranteed: true 
});
```

### Ver Items Activos
```javascript
console.log('Active items:', this.dropper.activeItems.length);
this.dropper.activeItems.forEach(item => {
  console.log(`- ${item.itemType} at (${item.x}, ${item.y})`);
});
```

### Testear Todos los Items
```javascript
// Crear uno de cada tipo para testing
const itemTypes = [
  'FRUITS',
  'WEAPON_TEMP_DOUBLE', 'WEAPON_TEMP_MACHINE', 'WEAPON_TEMP_FIXED',
  'POWER_UP_SHIELD', 'POWER_UP_BOMB', 'TIME_FREEZE', 'TIME_SLOW',
  'POWER_UP_LIFE'
];

itemTypes.forEach((type, i) => {
  this.dropper.dropFrom(null, 200 + i * 100, 200, {
    itemType: type,
    guaranteed: true
  });
});
```

---

## ✅ Checklist de Implementación

- [x] Crear todas las clases de items
- [x] Actualizar constantes globales
- [x] Modificar Hero para escudo y armas temporales
- [x] Actualizar Dropper con nueva loot table
- [x] Modificar HUD para vidas extra
- [x] Cargar spritesheet bonus.png en Level_01
- [x] Integrar sistema de pickup en update()
- [x] Arreglar doble instancia en main.js
- [ ] Testear todos los power-ups en juego
- [ ] Ajustar balance de drop rates si necesario

---

## 🎮 Controles del Jugador

### Armas Permanentes (Teclas)
- **1**: Arpón normal (permanente)
- **2**: Machine gun (permanente)
- **3**: Arpón fijo (permanente)
- **4**: Toggle doble arpón

### Items Temporales
- Duran 15 segundos y vuelven al arma que tenías antes
- No se pueden cambiar manualmente mientras están activos
- Al terminar, recuperas el arma que tenías (incluso si era machine gun o fijo)

---

## 💡 Tips de Diseño

1. **Balance**: La vida extra es MUY rara (0.8%) - considéralo un premio especial
2. **Táctica**: La bomba es útil para controlar cantidad, no para limpiar
3. **Escudo**: Usar estratégicamente - ¡no caduca si no te golpean!
4. **Tiempo**: Combinar time freeze + disparos = máxima efectividad
5. **Armas**: Machine gun mejor para múltiples objetivos, arpón para precisión

---

**¡Sistema completo implementado! 🎉**
