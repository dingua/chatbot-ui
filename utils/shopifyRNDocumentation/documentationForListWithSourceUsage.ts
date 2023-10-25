export function documentationForListWithSourceUsage() {
    console.log("documentationForListWithSourceUsage");
 const exmapleUsageWithProductListScreen =
 `
\`ListWithSource\` is a new list that's built on top of List which accepts a \`ListSource\` object as input instead of a \`data\` array and a \`renderItem\` function.
## Usage
 \`\`\`typescript
 // Create a \`ListSource\` object by calling \`useListSource\` hook.
// You can pass a context object and a dependency array to the hook.
// {send, i18n} is the context we pass, and [] is the dependency array.
const listSource = useListSource({send, i18n}, []);

// Generate a list of providers
const itemProviders = ListItemsBuilder.create<ProductsOverviewListContext>()
  .add(PerformanceMarkerListItemProvider, {
    screenName: ApdexScreen.ProductsOverview,
    interactive: true,
  })
  .add(ProductsGoToBarListItemProvider, {
    hasInsights: showInContextBar,
    onPress: send.onGoToBarPress,
  })
  .addIf(showInContextBar, ProductInsightsBarListItemProvider, null)
  .build();

// Add providers to listSource
listSource.updateItems(itemProviders);
 \`\`\`
 \`PerformanceMarkerListItemProvider\` is a \`ListItemProvider\` that has this interface:

 \`\`\`typescript
// Structure of a provider
export interface ListItemProvider<TProps, TData, TContext> {
  Component: FC<TProps>;
  getType?: (props: TProps, context: TContext) => string | number;
  getSize?: (props: TProps, context: TContext) => number | undefined;
  getKey?: (props: TProps, context: TContext) => string;
  onViewabilityChange?: (params: {
    isVisible: boolean;
    data: TData;
    props: TProps;
    context: TContext;
  }) => void;
  createPropsFromData: (data: TData, context: TContext) => TProps | undefined;
}

// Sample provider
export const MyComponentListItemProvider = createListItemProvider<
  MyComponentProps,
  MyComponentData,
  MyComponentContext
>({
  Component: MyComponent,
  getType() {
    return 'myComponent';
  },
  getSize() {
    return 100;
  },
  createPropsFromData(data, context) {
    // Convert data to props here and not in the component
    // You can also create callbacks here without worrying about react re-renders.
    const {order} = data;
    const {actions} = context;
    return {
      title: order.name,
      subtitle: order.price,
      onPress: () => {
        actions.onPress(order.id);
      },
    };
  },
});
\`\`\`
\`ListItemsBuilder\` is an API that allows you to easily declare the order of presentation of the \`ListItemProviders\` and the \`Component\` they render on screen.
At its core, its an convenience wrapper on an array of \`ListItemProviders\`, with useful helpers that follows the Builder pattern, so you can declaratively compose the layout of your screen.

- \`add\` : Adds a ListItemProvider into the builder.
- \`addIf\` : Adds a ListItemProvider into the builder if the condition is met.
- \`addMultiple\` : Provides a reference to the builder so you can append multiple ListItemProviders at once, ie: delegate a block of additions to a helper function. Allows post processing, to enable easy conditional injection of separators.
- \`addMultipleIf\` : As above, adds multiple if the condition is true.
- \`addWithIterator\`: To iterate over a list of items and add a ListItemProvider for each item.
- \`addWithIteratorIf\`: As above, adds multiple if the condition is true.
### SearchList with filtering and sorting
To implement a Searchlist that supports filtering and sorting, you can use \`SearchList\` component along with \`SelectableListWithSource\` component. Follow this example:
\`\`\`typescript
// OrderList is just an example
export function OrdersList({
    listSource,
    loading,
    loadingMore,
    refreshing,
    query,
    savedSearch,
    savedSearchOptions,
    send,
    store,
    location,
    filterOptions,
  }: Props) {

    return (
      <SelectableListWithSource
        source={listSource}
        keyExtractor={(item, index) =>
          \`\${index}-\${item._providerDataPairRef.data.id}\`
        }
        selecting={onBulkActionEnabled}
        estimatedItemSize={50}
        primaryAction={primaryBulkAction}
        sheetActions={bulkActions}
        selectedIDs={selectedOrderIDs}
        onChangeSelection={send.onOrdersSelectionChange}
        renderList={listProps => (
          <SearchList
            stickyHeaderIndices={stickyHeaderIndices}
            locationPicker={locationPicker}
            loading={loading}
            loadingMore={loadingMore}
            query={query}
            onQueryChange={send.onQueryChanged}
            onEndReached={send.onLoadMore}
            refreshing={refreshing}
            onRefresh={send.onRefresh}
            onResetFilters={send.onResetFilters}
            filters={filters}
            placeholder={i18n.translate('OrderList.placeholder')}
            noResultsTitle={noResultsTitle}
            noResultsDescription={noResultsDescription}
            sort={undefined}
            savedSearches={savedSearches}
            {...listProps}
          />
        )}
      />
    );
  }
\`\`\`
 `;
    return exmapleUsageWithProductListScreen;
}
