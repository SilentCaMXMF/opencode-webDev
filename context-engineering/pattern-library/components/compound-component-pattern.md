# Compound Component Pattern

**Category**: Component Pattern  
**Complexity**: Medium  
**Reusability**: High  
**Agents**: COMPONENT_DEVELOPER, DESIGN_SYSTEM  

## Description

The compound component pattern allows you to create flexible, composable components that can be used together in various combinations. This pattern is ideal for complex UI elements like menus, tabs, accordions, and forms.

## When to Use

- Components with multiple related sub-components
- Need flexible composition options
- Complex state management between related elements
- Design system components that need variations

## Implementation

### Basic Structure

```typescript
import React, { createContext, useContext } from 'react';

// Context for sharing state between components
const MenuContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
  selectedValue: '',
  setSelectedValue: () => {}
});

// Root component
interface MenuRootProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const MenuRoot: React.FC<MenuRootProps> = ({ 
  children, 
  defaultValue = '',
  onValueChange 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(defaultValue);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <MenuContext.Provider value={{
      isOpen,
      setIsOpen,
      selectedValue,
      setSelectedValue: handleValueChange
    }}>
      <div className="menu">
        {children}
      </div>
    </MenuContext.Provider>
  );
};

// Trigger component
interface MenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const MenuTrigger: React.FC<MenuTriggerProps> = ({ 
  children, 
  className = '' 
}) => {
  const { isOpen, setIsOpen } = useContext(MenuContext);

  return (
    <button
      className={`menu-trigger ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
    >
      {children}
    </button>
  );
};

// Item component
interface MenuItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  children, 
  value, 
  disabled = false,
  className = '' 
}) => {
  const { selectedValue, setSelectedValue } = useContext(MenuContext);

  const isSelected = selectedValue === value;

  return (
    <button
      className={`menu-item ${isSelected ? 'selected' : ''} ${className}`}
      onClick={() => !disabled && setSelectedValue(value)}
      disabled={disabled}
      role="menuitem"
      aria-selected={isSelected}
    >
      {children}
    </button>
  );
};

// Compound component export
const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Item: MenuItem,
  // Add more sub-components as needed
  Separator: () => <div className="menu-separator" role="separator" />,
  Group: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div role="group" aria-label={label}>
      {children}
    </div>
  )
};

export default Menu;
```

### Usage Examples

```typescript
// Basic usage
function ExampleMenu() {
  const handleSelect = (value: string) => {
    console.log('Selected:', value);
  };

  return (
    <Menu.Root defaultValue="option1" onValueChange={handleSelect}>
      <Menu.Trigger>
        Select Option <span aria-hidden>▼</span>
      </Menu.Trigger>
      <Menu.Item value="option1">Option 1</Menu.Item>
      <Menu.Item value="option2">Option 2</Menu.Item>
      <Menu.Separator />
      <Menu.Group label="Advanced Options">
        <Menu.Item value="advanced1">Advanced 1</Menu.Item>
        <Menu.Item value="advanced2" disabled>Advanced 2</Menu.Item>
      </Menu.Group>
    </Menu.Root>
  );
}

// With custom styling
function StyledMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger className="custom-trigger">
        <Icon name="menu" /> Menu
      </Menu.Trigger>
      <Menu.Item value="home">
        <Icon name="home" /> Home
      </Menu.Item>
      <Menu.Item value="settings">
        <Icon name="settings" /> Settings
      </Menu.Item>
    </Menu.Root>
  );
}
```

## Styling

```css
/* Base menu styles */
.menu {
  position: relative;
  display: inline-block;
}

.menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.menu-trigger:focus {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}

/* Menu content */
.menu-content {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.menu-item {
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
}

.menu-item:hover,
.menu-item:focus {
  background: #f0f0f0;
}

.menu-item.selected {
  background: #007acc;
  color: white;
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-separator {
  height: 1px;
  background: #eee;
  margin: 0.25rem 0;
}
```

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Menu from './Menu';

describe('Menu Compound Component', () => {
  it('should handle selection', async () => {
    const onSelect = jest.fn();
    
    render(
      <Menu.Root onValueChange={onSelect}>
        <Menu.Trigger>Menu</Menu.Trigger>
        <Menu.Item value="option1">Option 1</Menu.Item>
        <Menu.Item value="option2">Option 2</Menu.Item>
      </Menu.Root>
    );

    await userEvent.click(screen.getByText('Menu'));
    await userEvent.click(screen.getByText('Option 1'));

    expect(onSelect).toHaveBeenCalledWith('option1');
  });

  it('should prevent selection of disabled items', async () => {
    const onSelect = jest.fn();
    
    render(
      <Menu.Root onValueChange={onSelect}>
        <Menu.Trigger>Menu</Menu.Trigger>
        <Menu.Item value="option1">Option 1</Menu.Item>
        <Menu.Item value="option2" disabled>Option 2</Menu.Item>
      </Menu.Root>
    );

    await userEvent.click(screen.getByText('Menu'));
    await userEvent.click(screen.getByText('Option 2'));

    expect(onSelect).not.toHaveBeenCalledWith('option2');
  });
});
```

## Accessibility

- Use semantic HTML elements (`button`, `div` with proper ARIA roles)
- Implement keyboard navigation (Enter, Space, Arrow keys, Escape)
- Provide ARIA attributes (`aria-expanded`, `aria-selected`, `role`)
- Ensure focus management
- Support screen readers

## Performance Considerations

- Use React.memo for expensive sub-components
- Implement proper event delegation if many items
- Consider virtualization for very long menus
- Minimize re-renders with stable context values

## Variations

### Tabs Compound Component

```typescript
const Tabs = {
  Root: ({ children, defaultValue, onValueChange }) => {
    // Similar state management
  },
  List: ({ children }) => (
    <div role="tablist">{children}</div>
  ),
  Trigger: ({ children, value }) => (
    <button role="tab" aria-selected={isSelected}>{children}</button>
  ),
  Content: ({ children, value }) => (
    <div role="tabpanel" hidden={!isSelected}>{children}</div>
  )
};
```

### Accordion Compound Component

```typescript
const Accordion = {
  Root: ({ children }) => { /* state management */ },
  Item: ({ children, value }) => { /* individual accordion item */ },
  Trigger: ({ children }) => { /* clickable header */ },
  Content: ({ children }) => { /* collapsible content */ }
};
```

## Best Practices

1. Keep state management in the root component
2. Use React Context for sharing state between sub-components
3. Provide clear TypeScript interfaces for each sub-component
4. Include accessibility attributes from the start
5. Write comprehensive tests for all interactions
6. Consider keyboard navigation and mobile interactions
7. Document all available props and usage examples