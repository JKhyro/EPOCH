using Avalonia.Controls;
using Epoch.App.Native;
using Epoch.App.ViewModels;

namespace Epoch.App;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = MainWindowViewModel.Load();
    }
}
