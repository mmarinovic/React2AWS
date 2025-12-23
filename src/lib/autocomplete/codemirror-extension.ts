import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';
import { componentSchemas, componentNames } from './schema';

// Detect which component we're in by looking backwards for <ComponentName
function detectComponent(text: string, pos: number): string | null {
  const textBefore = text.slice(0, pos);
  const tagMatch = textBefore.match(/<(\w+)(?:\s|$)[^>]*$/);
  if (tagMatch) {
    const componentName = tagMatch[1];
    if (componentNames.includes(componentName)) {
      return componentName;
    }
  }
  return null;
}

// Check if cursor is inside a className attribute and get existing classes
function parseClassName(text: string, pos: number): {
  inClassName: boolean;
  prefix: string;
  existingClasses: string[];
} {
  const textBefore = text.slice(0, pos);
  const classNameMatch = textBefore.match(/className\s*=\s*["']([^"']*)$/);

  if (classNameMatch) {
    const classContent = classNameMatch[1];
    const words = classContent.split(/\s+/).filter(Boolean);
    const currentWord = words.length > 0 && !classContent.endsWith(' ')
      ? words.pop() || ''
      : '';
    return {
      inClassName: true,
      prefix: currentWord,
      existingClasses: words,
    };
  }

  return { inClassName: false, prefix: '', existingClasses: [] };
}

// Get category from a class value (e.g., "engine-postgres" -> "engine", "sm" -> "size")
function getCategoryFromClass(classValue: string, componentName: string): string | null {
  const schema = componentSchemas[componentName];
  if (!schema) return null;

  const option = schema.options.find(opt => opt.value === classValue);
  return option?.category || null;
}

// Get categories already used in the className
function getUsedCategories(existingClasses: string[], componentName: string): Set<string> {
  const usedCategories = new Set<string>();

  for (const cls of existingClasses) {
    const category = getCategoryFromClass(cls, componentName);
    if (category) {
      usedCategories.add(category);
    }
  }

  return usedCategories;
}

// Create completions for a component, filtering out used categories
function getCompletions(
  componentName: string,
  prefix: string,
  existingClasses: string[]
): CompletionResult | null {
  const schema = componentSchemas[componentName];
  if (!schema) return null;

  const usedCategories = getUsedCategories(existingClasses, componentName);

  const options = schema.options
    // Filter out options from categories already in use
    .filter(opt => !usedCategories.has(opt.category))
    // Filter by prefix match
    .filter(opt =>
      prefix === '' ||
      opt.value.toLowerCase().startsWith(prefix.toLowerCase()) ||
      opt.label.toLowerCase().includes(prefix.toLowerCase())
    )
    .map(opt => ({
      label: opt.value,
      detail: opt.description,
      type: opt.value.includes('-') ? 'property' : 'keyword',
      boost: opt.value.toLowerCase().startsWith(prefix.toLowerCase()) ? 1 : 0,
    }));

  if (options.length === 0) return null;

  return {
    from: 0,
    options,
    validFor: /^[\w.-]*$/,
  };
}

// Main completion function
function react2awsCompletions(context: CompletionContext): CompletionResult | null {
  const { state, pos } = context;
  const text = state.doc.toString();

  const { inClassName, prefix, existingClasses } = parseClassName(text, pos);
  if (!inClassName) return null;

  const componentName = detectComponent(text, pos);
  if (!componentName) return null;

  const completions = getCompletions(componentName, prefix, existingClasses);
  if (!completions) return null;

  return {
    ...completions,
    from: pos - prefix.length,
  };
}

// Export the extension
export const react2awsAutocomplete = autocompletion({
  override: [react2awsCompletions],
  activateOnTyping: true,
  maxRenderedOptions: 20,
  defaultKeymap: true,
  icons: true,
});
