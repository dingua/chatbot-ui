export function screenNavigationSetupDocumentation() {
    return `
    export function ExampleScreen() {
        const navigation = useNavigation();

        useLayoutEffect(() => {
          navigation.setOptions({
            headerLeft() {
              return <HeaderButton icon="MobileCancelMajor" onPress={...}>Cancel</HeaderButton>
            },
            headerRight() {
              return <HeaderButton icon="MobileHorizontalDotsMajor" onPress={...}>Menu</HeaderButton>
            }
          })
        }, [navigation]);
      }
    `;
}
