export function documentationOfUseActions() {
  console.log("documentationOfUseActions");
    const documentation = `
# Simplified Documentation: useActions

As screens become larger and more complex, passing numerous callbacks as props to the presentation layer can lead to a pattern known as "prop drilling." This can make it difficult to maintain screens with lots of state and complex interfaces.

To avoid prop drilling, you can use the \`useActions\` hook, which consolidates all of a view's actions into one handler. This simplifies how callbacks are defined and passed to the UI.

## Setting up the hook

### Configuring types

Start by defining the actions that your screen supports in a \`types.ts\` file adjacent to your screen:

\`\`\`typescript
export interface Actions {
  onIncrementPress(): void;
  onAddPress(quantity: number): void;
}
\`\`\`

In this example, we have defined two actions: \`onIncrementPress\` to increment a value and \`onAddPress\` to add a quantity to the value.

### Setting up the screen

Import the \`useActions\` hook from \`foundations/hooks/useActions\` and assign its function type argument the \`Actions\` type exported previously. Create an object where each key is a function that implements the corresponding action:

\`\`\`typescript
import {useActions} from 'foundations/hooks/useActions';
import type {Actions} from './types';

export function OrderDetailsScreen() {
  const [quantity, setQuantity] = useState(0);

  const {send} = useActions<Actions>(() => ({
    onIncrementPress() {
      setQuantity(quantity => quantity + 1);
    },
    onAddPress(quantity) {
      setQuantity(prevQuantity => prevQuantity + quantity);
    },
  }));

  return <ContentLayout quantity={quantity} send={send} />;
}
\`\`\`

The \`useActions\` hook returns an object containing the \`send\` object, which contains all defined actions. Each entry in the \`send\` object represents one action.

## Sending actions from the UI

With the business logic configured, actions can now be sent at any level of the presentation layer. Import the \`Actions\` type and use it to type the \`send\` prop of the component:

\`\`\`typescript
import type {Actions} from '../types';

interface Props {
  quantity: number;
  send: Actions;
}

export function ContentLayout({quantity, send}: Props) {
  return (
    <Box>
      <Text>Quantity: {quantity}</Text>
      <Button onPress={send.onIncrementPress}>Increment</Button>
      <Button onPress={() => send.onAddPress(quantity)}>Add {quantity}</Button>
    </Box>
  );
}
\`\`\`

Here, we're using the \`Actions\` type to type the \`send\` prop of the component, giving us access to all the specified action typings.

## Other sources of events

The events handled by \`useActions\` are not limited to UI events. You can also include events triggered from external sources.

For example, timer events can be handled in an action:

\`\`\`typescript
useEffect(() => {
  const timerId = setInterval(send.onClockTick, 1000);
  return () => clearInterval(timerId);
}, [send]);
\`\`\`

React Navigation exposes the \`useFocusEffect\` hook to handle focus/blur events:

\`\`\`typescript
useFocusEffect(useCallback(() => {
  send.onScreenFocus();
  return send.onScreenBlur;
}, [send]));
\`\`\`

## Organizing events

In most cases, all event handling code can be placed in the body of the \`useActions\` hook. However, there are a few other scenarios you might encounter.

### Reusing existing functions

If the event delegates to a single function, you can expose those features to child components while still using the preferred event naming convention. For example, navigation actions can be wrapped in a hook:

\`\`\`typescript
const {
  navigateToCompanyDetails,
  ...
} = useCustomerOverviewNavigation();

const [search, setSearch] = useState('');

const {send} = useActions(() => ({
  onCustomerPress: navigateToCompanyDetails,
  onSearchChange: setSearch,
}));
\`\`\`

### Multiple events with the same behavior

If multiple events have the same behavior, it is better to create separate actions and have one delegate to the other. For example, a cancel button and a back button on a form can have the same behavior:

\`\`\`typescript
const {send} = useActions(() => ({
  onBackPress() {
    send.onCancelPress();
  },
  onCancelPress() {
    navigation.goBack();
  },
}));
\`\`\`

By following these guidelines, you can simplify your code and avoid the complexities of prop drilling.
`;

    return documentation;
}
