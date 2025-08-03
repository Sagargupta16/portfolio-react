# CSS Architecture Documentation

This document explains the restructured CSS architecture for easier maintenance and future modifications.

## 📁 File Structure

```
src/styles/
├── variables.css     # CSS custom properties (design tokens)
├── base.css         # Reset styles and base HTML elements
├── typography.css   # Typography system and text utilities
├── layout.css       # Layout utilities (flexbox, grid, spacing)
├── components.css   # Reusable component styles
├── utilities.css    # Utility classes for common patterns
└── responsive.css   # Media queries and responsive utilities
```

## 🎨 Design System

### Colors

- `--color-primary`: Main brand color (#ffcc66)
- `--color-bg`: Background color (#1e1e26)
- `--color-bg-variant`: Secondary background (#2c2c33)
- `--color-white`: White text color
- `--color-light`: Muted text color

### Spacing System

- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)

### Typography Scale

- `--font-size-xs`: 0.75rem
- `--font-size-sm`: 0.875rem
- `--font-size-base`: 1rem
- `--font-size-lg`: 1.125rem
- `--font-size-xl`: 1.25rem
- `--font-size-2xl`: 1.5rem
- `--font-size-3xl`: 2rem
- `--font-size-4xl`: 2.5rem

## 🛠 Usage Examples

### Typography Classes

```html
<h1 class="heading-1">Main Title</h1>
<h2 class="heading-2">Section Title</h2>
<p class="text-light">Muted text</p>
<span class="text-primary">Highlighted text</span>
```

### Layout Classes

```html
<div class="flex justify-center items-center gap-md">
  <button class="btn">Button 1</button>
  <button class="btn btn--primary">Button 2</button>
</div>

<div class="grid grid-cols-3 gap-lg">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

### Component Classes

```html
<!-- Buttons -->
<button class="btn">Default Button</button>
<button class="btn btn--primary">Primary Button</button>
<button class="btn btn--outline">Outline Button</button>
<button class="btn btn--small">Small Button</button>

<!-- Cards -->
<div class="card card--centered card--shadow">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

<!-- Images -->
<img src="image.jpg" class="img img--rounded img--shadow" alt="Description" />
```

### Utility Classes

```html
<!-- Spacing -->
<div class="p-lg m-xl">Content with padding and margin</div>

<!-- Colors -->
<div class="bg-primary text-white">Colored background</div>

<!-- Shadows and Effects -->
<div class="shadow-lg backdrop-blur rounded-md">Glass effect</div>

<!-- Transitions -->
<div class="transition hover:transform hover:shadow-lg">Hover effects</div>
```

### Responsive Classes

```html
<!-- Hide/show on different screens -->
<div class="hide-mobile show-tablet">Tablet and desktop only</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
  <!-- Content -->
</div>

<!-- Mobile-specific styles -->
<div class="flex mobile:flex-col mobile:text-center">
  <!-- Content -->
</div>
```

## 🎯 Migration Guide

### From Old CSS to New CSS

#### Old way:

```css
.my-component {
  background-color: var(--color-bg-variant);
  padding: 2rem;
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  transition: all 0.4s ease-in-out;
}
```

#### New way:

```html
<div class="card flex justify-center items-center gap-lg transition">
  <!-- Content -->
</div>
```

### Component Updates

#### Buttons

- Replace `btn-primary` with `btn btn--primary`
- Use `btn--small`, `btn--large` for size variants
- Use `btn--outline` for outlined buttons

#### Cards

- Use `card` base class
- Add `card--centered` for centered content
- Add `card--shadow` for drop shadows
- Add `card--interactive` for clickable cards

#### Typography

- Use semantic heading classes: `heading-1`, `heading-2`, etc.
- Use utility classes: `text-light`, `text-primary`, `text-center`

## 🔧 Customization

### Adding New Colors

Add to `variables.css`:

```css
:root {
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

### Adding New Spacing

Add to `variables.css`:

```css
:root {
  --spacing-5xl: 8rem;
  --spacing-6xl: 12rem;
}
```

Then create utility classes in `utilities.css`:

```css
.p-5xl {
  padding: var(--spacing-5xl);
}
.m-5xl {
  margin: var(--spacing-5xl);
}
```

### Creating New Components

Add to `components.css`:

```css
.my-component {
  /* Base styles */
  background-color: var(--color-bg-variant);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  transition: var(--transition);
}

.my-component--variant {
  /* Variant styles */
  background-color: var(--color-primary);
  color: var(--color-bg);
}

.my-component:hover {
  /* Hover states */
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

## 📱 Responsive Design

The system uses a mobile-first approach:

1. **Base styles**: Mobile (default)
2. **Tablet**: 768px and up
3. **Desktop**: 1024px and up

Use responsive prefixes:

- `tablet:` for tablet and up
- `desktop:` for desktop and up
- `mobile:` for mobile-specific overrides

## 🌙 Theme Support

The system supports theme switching:

- Add `data-theme="light"` to `<html>` for light theme
- Add `data-theme="dark"` to `<html>` for dark theme (default)

## ♿ Accessibility

The system includes:

- Focus management with `focus-visible`
- High contrast mode support
- Reduced motion support
- Semantic color usage
- Proper focus indicators

## 🚀 Performance

Benefits of the new structure:

- **Modular loading**: Only load what you need
- **Better caching**: Separate files cache independently
- **Smaller bundles**: Tree-shaking friendly
- **Maintainable**: Easier to find and modify styles
- **Consistent**: Design system ensures consistency
- **Scalable**: Easy to extend and customize

## 📝 Best Practices

1. **Use utility classes** for simple styling
2. **Create components** for complex, reusable patterns
3. **Follow naming conventions** (BEM-like structure)
4. **Use CSS custom properties** for values that might change
5. **Test responsive design** on multiple screen sizes
6. **Maintain accessibility** with proper focus management
7. **Keep specificity low** by avoiding deeply nested selectors
8. **Document custom components** as you create them

## 🔄 Legacy Support

The new system maintains backward compatibility with existing component CSS files. You can gradually migrate by:

1. Using new utility classes in new components
2. Refactoring existing components one at a time
3. Removing redundant styles as you migrate
4. Testing thoroughly after each change

This approach allows for incremental adoption without breaking existing functionality.
