export function documentationForListWithSourceUsage() {
    return `
Usage:
\`\`\`typescript
// Create a ListSource object by calling useListSource hook.
// You can pass a context object and a dependency array to the hook.
// {send, i18n} is a context we pass to the hook.
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
listSource.update(itemProviders);
\`\`\`
ListWithSource
ListWithSource is a new list that's built on top of List which accepts a ListSource object as input instead of a data array and a renderItem function.

You can also easily create SelectableListWithSource and SearchListWithSource.

Props
ListWithSource has the same props as List with the following addition:

enableViewabilityTracking
boolean If set to true, the ListItemProviders will received viewability callbacks if they have onViewabilityChange method defined.

Usage
\`\`\`typescript
export function MyPageLayout({listSource}: Props) {
    return (
      <ListWithSource
        source={listSource}
        onRefresh={send.onRefresh}
        refreshing={refreshing}
        backgroundColor="polaris-surface-neutral-subdued"
        estimatedItemSize={45}
        enableViewabilityTracking
      />
    );
  }
\`\`\`
Example with SelectableListWithSource:
\`\`\`typescript
// OrdersList here is just an example where we used SelectableListWithSource
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
    // [sic]
    return (
      <SelectableListWithSource
        source={listSource}
        keyExtractor={(item, index) =>
          \`\$\{index\}-\$\{item._providerDataPairRef.data.id\}\`
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
ListItemsBuilder is an API that allows you to easily declare the order of presentation of the ListItemProviders and the Component they render on screen. At its core, its an convenience wrapper on an array of ListItemProviders, with useful helpers that follows the Builder pattern, so you can declaratively compose the layout of your screen.

add : Adds a ListItemProvider into the builder.
addIf : Adds a ListItemProvider into the builder if the condition is met.
addMultiple : Provides a reference to the builder so you can append multiple ListItemProviders at once, ie: delegate a block of additions to a helper function. Allows post processing, to enable easy conditional injection of separators.
addMultipleIf : As above, adds multiple if the condition is true.
addWithIterator: To iterate over a list of items and add a ListItemProvider for each item.
addWithIteratorIf: As above, adds multiple if the condition is true.
Example usage from buildOrdersOverview
\`\`\`typescript
const items = ListItemsBuilder.create<OrdersOverviewListContext>()
.add(PerformanceMarkerListItemProvider, {
  screenName: ApdexScreen.OrdersOverview,
  interactive: true,
  loadedFromCache,
})
.add(OrdersGoToBarListItemProvider, {
  hasInsights,
  onPress: send.onGoToBarPress,
})
.addIf(hasInsights, OrderInsightsBarListItemProvider, {
  initialTab: initialInsightsTab ?? DateRangeKey.Last30Days,
  shopTimezone: responseData.shop.ianaTimezone,
})
/**
 * Adds the navigation section.
 */
.addMultiple(
  builder => {
    builder
      .addIf(hasOrdersPermission, NavigationCellListItemProvider, {
        icon: 'OrdersMajor',
        label: i18n.translate('NavigationLayout.allOrders'),
        onPress: send.onAllOrdersPress,
      })
      .addIf(hasDraftOrdersPermission, NavigationCellListItemProvider, {
        icon: 'DraftOrdersMajor',
        label: i18n.translate('NavigationLayout.draftOrders'),
        onPress: send.onDraftOrdersPress,
      })
      .addIf(hasOrdersPermission, NavigationCellListItemProvider, {
        icon: 'AbandonedCartMajor',
        label: i18n.translate('NavigationLayout.abandonedCheckouts'),
        onPress: send.onAbandonedCheckoutsPress,
      });
  },
  (builder, _, last) => {
    if (!last) {
      builder.add(ThinSeparatorListItemProvider, {});
    }
  },
)
/**
 * Adds a list of order related alert banners based on resource alerts.
 */
.addIf(alerts.length > 0, ResourceAlertListItemProvider, {
  alerts,
})
/**
 * Adds the Location Picker section
 */
.addMultipleIf(showLocationSelector, builder => {
  builder
    .add(SeparatorListItemProvider, null)
    .add(LocationCellListItemProvider, {
      name: location.name ?? '',
      onPress: send.onLocationPress,
    });
})
.addMultiple(builder => {
  ordersSections.forEach(section => {
    addOrdersSection(
      builder,
      i18n.translate('OrdersOverview.More'),
      send,
      section,
    );
  });
})
.addMultipleIf(
  draftOrders !== undefined && draftOrders.length > 0,
  builder => {
    addDraftOrderSection(builder, draftOrders!, i18n, send);
  },
)
.build();

listSource.updateItems(items);
\`\`\`

ListItemProviders are adapters that can create props from data + context, "bind" those props into a Component, and also define data required to optimize list rendering size and type. You can use the createListItemProvider method to create one.
A ListItemProvider has three generics, Props, Data, and Context.

The Props correspond to the props required by the Component you are rendering.

The Data can be domain models, GraphQL resources, monorail event handles, etc.

The Context generally comes from the ListSource, and is a set of shared dependencies like i18n, or the screens send Actions assorted items in your list require for rendering and user interaction.

The Data and Context combine to create the props, createPropsFromData is where you use context to massage your data in to the props expected by your Component.

We typically put data transform / business logic into a wrapper Component that massages domain specific props into generalized props for Polaris Components. Instead of using a wrapper Component to encapsulate this kind of data transform logic, it can live in a ListItemProvider with in createPropsFromData.

The beauty of this adapter is that createPropsFromData provides us the perfect place to write this data processing code alongside UI binding code and output props for our Polaris components. createPropsFromData lends itself well to validating more complicated data to props transforms when necessary.

createPropsFromData is also an ideal plaice to merge domain data and i18n translations. A big benefit of this strategy is that our Components can absolve themselves of the burden of i18n string interpolation, which usually requires domain specific props required for substitution, ie: numberOfOrders, and allows us to build more consistent UI, by rendering Polaris Components instead of wrappers.

Add i18n to your ListSourceContext and you'll have access to it in your ListItemProvider.
ListItemProvider Examples
Simple Polaris Component ListItemProvider: Data === Props
For really simple situations, you can accept Data that matches the Props expected by your Component. Often for these types of ListItems, Context is unnecessary.

In this example, to render a SectionHeader as a ListItem, we're specifying that the Data is HeaderProps, (title, subitle, action, etc), which matches the Props expected by the SectionHeader component.
\`\`\`typescript
export const SectionHeaderListItemProvider = createListItemProvider<
  HeaderProps,
  HeaderProps,
  unknown
>({
  Component: props => {
    const {title, subtitle, action} = props;

    return <Header title={title} subtitle={subtitle} action={action} />;
  },
  getType() {
    return 'sectionHeader';
  },
  getSize() {
    return 46;
  },
  createPropsFromData(props) {
    return props;
  },
});
\`\`\`
    `;
}
