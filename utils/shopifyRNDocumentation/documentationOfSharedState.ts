export function documentationOfSharedState() {
    console.log("documentationOfSharedState");
    const sharedStateText = `
When multiple screens need to coordinate on a feature, they need a mechanism to access and update the shared state. To accomplish this goal, we have the SharedState library. It uses code from Shop's useSharedState hook, but modified to better suit our needs. In particular, we introduce the concept of the Repo, which is used to create and update shared state objects.

Terms
Repo: Creates and manages Store objects. When a new store is requested the Repo initializes it, or fetches an existing Store. These are created at the module level.
Store: Contains the state and functions to get, update, and observe changes to that state. Created in Screen components, and passed via props-drilling to child components. In the Screen you will use it in useActions to access and update the current state, in Components you will use it alongside useSelector to subscribe to state changes.
Operations: Additional functions that enhance the built-in Store functions (e.g. more complex state change helpers – validation or state machine checks would go in an operation). They are defined in the Repo and added to every Store object.
Selector: Simply put, a mapping function (state: State) => Value. Used in conjunction with the useSelector hook, components can subscribe to only those state changes that are relevant. Selectors can also be passed to store.get(selector) and they will return the same data as a selector (but without subscribing to changes).
Observer: These are used via the useObserve and useSelector hooks. All state changes trigger all observers (and therefore all selector functions), but only changes to data will cause a component to rerender (comparison is done using Object.is for primitive data, and shallowEqual for objects and arrays).
Middleware: Extensions that can listen for lifecycle and change events.
NOTE
State in this context refers to the parts of the UI that are editable by the user, rather than state that is read-only (e.g. API responses). Text fields, checkboxes, resource selections, etc are all candidates for storing in [shared] state.

It is expected that editable graphql data will be placed in state. See Editing GraphQL Data for an example.

TL;DR
Create a Repo in a state.ts module: repo = createRepo({...})
Create a Store in your Screen: {store} = useSharedStore(repo, ...)
Update the store via useActions: onTitleChange(title) { store.update({title}) }
Pass the store via props drilling to components: <Title store={store} send={send} />
Subscribe to state changes using useSelector: title = useSelector(store, state => state.title)
Components send updates the usual way: onChange={send.onTitleChange};
Use operations if necessary: onTitleChange(title) { store.validateTitle(title) }
Use a Selector function if necessary, defined in state.ts. const selectPokemon = (state: State) => state.pokemon.type === 'Captured' ? state.pokemon : null;
Use Middleware to coordinate with other external systems, for instance syncing state with User Preferences
Example:
in state.ts:
export interface State {
    title: string;
    address: Address;
  }

  export const repo = createRepo({
    initial: (): State => ({
      title: '',
      address: {street: '', number: '', }
    }),
You can define operations:
    export const repo = createRepo({
        initial: () => ({...}),
        operations: (store) => ({
        addItem(item: Item) {
            store.update(state => ({items: state.items.concat([item])}));
        },
        addSpecialItem(item: Item) {
            this.addItem({...item, isSpecial: true});
        },
store can be used in screen.tsx liek this:
    import {repo} from '../state.ts';

    function EditProductScreen({productId}: Props) {
    const {store} = useSharedStore(repo, productId)
    ...
    }
You can define selectors:
    const title: string = useSelector(store, state => state.title);

Updating state in a component within usActions:
    const {send} = useActions<Actions>(() => ({
        onTitleChange(title) {
        // only update the title
        store.update({title});
        },
        onIncrementPress() {
        // increment the count based on the current value
        store.update(state => ({count: state.count + 1}));
        },
    }));
_____
Why not one central store like Redux!?
Our shared state has a specific use case in mind: Editing Resources.

For example, if you are editing Product id:12 on one tab, and just so happen to also be editing Product id:42 on another, you don't want those two shared states clobbering each other. You want Product 12 to have one state (shared among multiple screens), and Product 42 to have its own state (also shared among multiple screens).

In Redux you could accomplish this with something like store.products[productId]. When you unmount those screens, do you reset that product state or leave it in memory? In the reducer, in every action, you will need to make sure that the products[id] is initialized before commiting the change.

Contrast this with our repo approach: in the product-edit screen, we can request a shared state keyed off the id, and it will already be initialized with our initial data. When the product edit screen (and any screen using that shared state) is unmounted, that data will be cleared out and freed from memory, reducing the global memory clutter.

`
;

const sharedStateVariable: string = sharedStateText.trim();
console.log("😀 sharedStateVariable", sharedStateVariable);
return sharedStateVariable;
}
