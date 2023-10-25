export function documentationScreenFileStructure() {
    const documentation = `
    ScreenName
    |__ index.tsx
    |__ ScreenNameScreen.tsx
    |__ ScreenNameLayout.tsx
    |__ state.ts
    |__ types.ts

    Example of ScreenNameScreen.tsx
    \`\`\`typescript
    import ...

    export interface Props {
        productId: string;
    }

    export function ScreenNameScreen({productId}: Props) {
        ....
        return (
            <SafeAreaView edges={['top', 'bottom']} style={{flex: 1}}>
              <Screen
                loading={!isFirstLoadComplete}
                refreshing={isRefetching}
                error={error}
                blocking={isBlocking}
                onRefresh={send.onRefresh}
                testID={TestID.ProductsListScreen.screen}
                renderContent={() => {
                  if (shouldDisplayEmptyResult) {
                    store.update({onBulkActionEnabled: false});

                    return emptyState;
                  }

                  return (
                    <>
                      <ScreenNameLayout
                        loading={isLoading || isClearingSearchField}
                        loadingMore={loadingMore}
                        refreshing={isRefetching}
                        sortOptions={sortOptions}
                        defaultSortOption={defaultSortOption}
                        appliedSortOption={appliedSortOption}
                        query={searchQuery}
                        filterOptions={filterOptions}
                        savedSearch={savedSearch}
                        savedSearchOptions={savedSearchOptions}
                        send={send}
                        noResultsEmptyState={{
                          title: noResultsTitle,
                          description: '',
                          icon: noResultsIcon,
                        }}
                        store={store}
                        sheetActions={sheetActions}
                        listSource={listSource}
                        primaryAction={primaryAction}
                        isGiftCardList={isGiftCardList}
                      />
                      {overflowMenuFocusedSheet}
                    </>
                  );
                }}
              />
            </SafeAreaView>
          );
        }
    \`\`\`

    Example of ScreenNameLayout.tsx
    \`\`\`typescript
    import ...

    export interface Props {
        loading: boolean;
        loadingMore: boolean;
        refreshing: boolean;
        sortOptions: SortOption[];
        defaultSortOption: SortOption;
        appliedSortOption: SortOption;
        query: string;
        filterOptions: FilterOption[];
        savedSearch: SavedSearch;
        savedSearchOptions: SavedSearchOption[];
        send: Send;
        noResultsEmptyState: EmptyState;
        store: Store;
        sheetActions: SheetActions;
        listSource: ListSource;
        primaryAction: PrimaryAction;
        isGiftCardList: boolean;
    }

    export function ScreenNameLayout({...}: Props) {

        ...
        render the UI Components
        ...

    }
    \`\`\`

    Example of index.tsx
    \`\`\`typescript
    export * from './ScreenNameScreen';
    \`\`\`

    Example of state.ts
    \`\`\`typescript
    export const repo = createRepo({
        initial: (): State => ({
          products: [],
          totalCount: 0,
          isGiftCardList: false,
          onBulkActionEnabled: false,
          selectedProducts: new Map(),
          selectedProductFilters: {
            vendor: [],
            tag: [],
            status: [],
            availability: [],
            giftCard: [],
            productType: [],
            publishingError: [],
          },
          isFirstLoadComplete: false,
          isClearingSearchField: false,
          overflowMenuFocusedSheetVisible: false,
        }),
        operations: store => ({
          /**
           * Locally deletes products from the list, so the user can retain their scroll position
           * while they delete products via bulk action.
           * @param productsIds
           */
          deleteProducts(productIds: string[]) {
            const state = store.get();

            const productsWithDeletions = state.products.filter(
              // filter out all the deleted products from the state.
              product => !productIds.includes(product.id),
            );
            store.update({
              selectedProducts: new Map(),
              products: productsWithDeletions,
              // Update the total products count, as we've removed some.
              totalCount: productsWithDeletions.length,
            });
          },
        }),
      });
    ... state logic functions
    \`\`\`

    Example of types.ts
    \`\`\`typescript
    export interface ProductsListActions extends OverflowMenuActions {
        onProductPress(productId: string): void;
        ...
    }

    ...
    Define all the types used in the ScreenNameScreen.tsx, State.ts ...etc
    \`\`\`
    `;
    return documentation;
}
