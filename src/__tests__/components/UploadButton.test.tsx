import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import UploadButton from '@/src/components/Buttons/UploadButton';
import { useToast } from '@/src/context/ToastContext';
import { useFileUpload } from '@/src/mutations';

// モック設定
jest.mock('@/src/mutations', () => ({
  useFileUpload: jest.fn(),
}));

jest.mock('@/src/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/src/components/EmptySendDialog', () => {
  return function MockEmptySendDialog({ open, toggleDialog }: { open: boolean; toggleDialog: () => void }) {
    if (!open) return null;
    return (
      <div data-testid="empty-send-dialog">
        <span>ファイルが選択されていません</span>
        <button onClick={toggleDialog}>閉じる</button>
      </div>
    );
  };
});

jest.mock('@/src/components/IncorrectUploadDialog', () => {
  return function MockIncorrectUploadDialog({
    open,
    toggleDialog,
    areaNames
  }: {
    open: boolean;
    toggleDialog: () => void;
    areaNames: string[];
  }) {
    if (!open) return null;
    return (
      <div data-testid="incorrect-upload-dialog">
        <span>不正なファイルが含まれています</span>
        <span>有効なエリア: {areaNames.join(', ')}</span>
        <button onClick={toggleDialog}>閉じる</button>
      </div>
    );
  };
});

const mockUploadFiles = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowErrorWithRetry = jest.fn();

const mockUseFileUpload = useFileUpload as jest.MockedFunction<typeof useFileUpload>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('UploadButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFileUpload.mockReturnValue({
      uploadFiles: mockUploadFiles,
      isUploading: false,
      progress: {
        isUploading: false,
        currentFile: null,
        uploadedCount: 0,
        totalCount: 0,
      },
    });
    mockUseToast.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: jest.fn(),
      showErrorWithRetry: mockShowErrorWithRetry,
    });
  });

  describe('レンダリング', () => {
    test('Uploadボタンが表示される', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(screen.getByText('Upload file')).toBeInTheDocument();
    });

    test('送信ボタンが表示される', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
    });

    test('ファイル入力が存在する', () => {
      const { container } = render(<UploadButton areaNames={['東京']} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    test('ファイル入力はmultiple属性を持つ', () => {
      const { container } = render(<UploadButton areaNames={['東京']} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('multiple');
    });

    test('CloudUploadIconが表示される', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(screen.getByTestId('CloudUploadIcon')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    test('error=trueの場合、Uploadボタンが無効になる', () => {
      render(<UploadButton areaNames={['東京']} error={true} />);

      const uploadButton = screen.getByText('Upload file').closest('label');
      expect(uploadButton).toHaveClass('Mui-disabled');
    });

    test('error=falseの場合、Uploadボタンは有効', () => {
      render(<UploadButton areaNames={['東京']} error={false} />);

      const uploadButton = screen.getByText('Upload file').closest('label');
      expect(uploadButton).not.toHaveClass('Mui-disabled');
    });

    test('errorのデフォルト値はfalse', () => {
      render(<UploadButton areaNames={['東京']} />);

      const uploadButton = screen.getByText('Upload file').closest('label');
      expect(uploadButton).not.toHaveClass('Mui-disabled');
    });
  });

  describe('アップロード中の状態', () => {
    test('アップロード中は送信ボタンが無効になる', () => {
      mockUseFileUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        isUploading: true,
        progress: {
          isUploading: true,
          currentFile: 'test.pdf',
          uploadedCount: 1,
          totalCount: 3,
        },
      });

      render(<UploadButton areaNames={['東京']} />);

      const sendButton = screen.getByRole('button', { name: 'アップロード中...' });
      expect(sendButton).toBeDisabled();
    });

    test('アップロード中はボタンテキストが「アップロード中...」に変わる', () => {
      mockUseFileUpload.mockReturnValue({
        uploadFiles: mockUploadFiles,
        isUploading: true,
        progress: {
          isUploading: true,
          currentFile: 'test.pdf',
          uploadedCount: 0,
          totalCount: 1,
        },
      });

      render(<UploadButton areaNames={['東京']} />);

      expect(screen.getByText('アップロード中...')).toBeInTheDocument();
    });

    test('アップロード中でないときは「送信」と表示される', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
      expect(screen.queryByText('アップロード中...')).not.toBeInTheDocument();
    });
  });

  describe('送信処理（ファイルなし）', () => {
    test('ファイルなしで送信するとEmptySendDialogが表示される', async () => {
      render(<UploadButton areaNames={['東京']} />);

      fireEvent.click(screen.getByRole('button', { name: '送信' }));

      await waitFor(() => {
        expect(screen.getByTestId('empty-send-dialog')).toBeInTheDocument();
      });
    });

    test('EmptySendDialogに正しいメッセージが表示される', async () => {
      render(<UploadButton areaNames={['東京']} />);

      fireEvent.click(screen.getByRole('button', { name: '送信' }));

      await waitFor(() => {
        expect(screen.getByText('ファイルが選択されていません')).toBeInTheDocument();
      });
    });

    test('EmptySendDialogの閉じるボタンでダイアログが閉じる', async () => {
      render(<UploadButton areaNames={['東京']} />);

      fireEvent.click(screen.getByRole('button', { name: '送信' }));

      await waitFor(() => {
        expect(screen.getByTestId('empty-send-dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: '閉じる' }));

      await waitFor(() => {
        expect(screen.queryByTestId('empty-send-dialog')).not.toBeInTheDocument();
      });
    });

    test('ファイルなしで送信してもuploadFilesは呼ばれない', async () => {
      render(<UploadButton areaNames={['東京']} />);

      fireEvent.click(screen.getByRole('button', { name: '送信' }));

      await waitFor(() => {
        expect(screen.getByTestId('empty-send-dialog')).toBeInTheDocument();
      });

      expect(mockUploadFiles).not.toHaveBeenCalled();
    });
  });

  describe('ダイアログ初期状態', () => {
    test('初期状態ではEmptySendDialogは表示されない', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(screen.queryByTestId('empty-send-dialog')).not.toBeInTheDocument();
    });

    test('初期状態ではIncorrectUploadDialogは表示されない', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(screen.queryByTestId('incorrect-upload-dialog')).not.toBeInTheDocument();
    });
  });

  describe('hooks使用', () => {
    test('useFileUploadが呼ばれる', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(mockUseFileUpload).toHaveBeenCalled();
    });

    test('useToastが呼ばれる', () => {
      render(<UploadButton areaNames={['東京']} />);

      expect(mockUseToast).toHaveBeenCalled();
    });
  });

  describe('プロパティ', () => {
    test('空のareaNames配列でも動作する', () => {
      render(<UploadButton areaNames={[]} />);

      expect(screen.getByText('Upload file')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument();
    });

    test('複数のエリア名を受け取れる', () => {
      render(<UploadButton areaNames={['東京', '大阪', '福岡']} />);

      expect(screen.getByText('Upload file')).toBeInTheDocument();
    });

    test('日本語のエリア名を受け取れる', () => {
      render(<UploadButton areaNames={['北海道', '沖縄県']} />);

      expect(screen.getByText('Upload file')).toBeInTheDocument();
    });
  });

  describe('ボタンスタイル', () => {
    test('Uploadボタンはlabel要素でラップされている', () => {
      render(<UploadButton areaNames={['東京']} />);

      const uploadLabel = screen.getByText('Upload file').closest('label');
      expect(uploadLabel).toBeInTheDocument();
    });

    test('送信ボタンはbutton要素', () => {
      render(<UploadButton areaNames={['東京']} />);

      const sendButton = screen.getByRole('button', { name: '送信' });
      expect(sendButton.tagName).toBe('BUTTON');
    });

    test('UploadボタンはMUIのcontainedバリアント', () => {
      render(<UploadButton areaNames={['東京']} />);

      const uploadLabel = screen.getByText('Upload file').closest('label');
      expect(uploadLabel).toHaveClass('MuiButton-contained');
    });

    test('送信ボタンはMUIのcontainedバリアント', () => {
      render(<UploadButton areaNames={['東京']} />);

      const sendButton = screen.getByRole('button', { name: '送信' });
      expect(sendButton).toHaveClass('MuiButton-contained');
    });
  });

  describe('ファイル入力属性', () => {
    test('ファイル入力はvisuallyHiddenInputクラスを持つ', () => {
      const { container } = render(<UploadButton areaNames={['東京']} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveClass('visuallyHiddenInput');
    });

    test('ファイル入力はtype="file"', () => {
      const { container } = render(<UploadButton areaNames={['東京']} />);

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });
});
