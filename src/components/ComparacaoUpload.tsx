
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Calendar, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotaFiscal {
  Numero_NF: string;
  Data_Emissao: string;
  MODELO: string;
  ORGANIZATION_ID: number;
  Quantidade: number;
  Empresa: string;
}

interface ApiResponse {
  total_no_banco: number;
  total_no_arquivo: number;
  faltantes: NotaFiscal[];
}

interface ComparacaoUploadProps {
  onResult: (resultado: ApiResponse) => void;
}

const ComparacaoUpload: React.FC<ComparacaoUploadProps> = ({ onResult }) => {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setArquivo(file);
      } else {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos Excel (.xlsx ou .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setArquivo(file);
      } else {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos Excel (.xlsx ou .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const verificarNotas = async () => {
    if (!arquivo) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo Excel.",
        variant: "destructive"
      });
      return;
    }

    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro",
        description: "Por favor, selecione as datas de início e fim.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', arquivo);

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        `http://localhost:8000/verificar_notas?data_inicio=${dataInicio}&data_fim=${dataFim}&formato=json`,
        {
          method: 'POST',
          body: formData
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) throw new Error('Erro ao verificar notas');
      
      const data: ApiResponse = await response.json();
      onResult(data);
      
      toast({
        title: "Sucesso",
        description: `Comparação concluída! ${data.faltantes.length} notas faltantes encontradas.`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo. Verifique a conexão com a API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const exportarExcel = async () => {
    if (!arquivo || !dataInicio || !dataFim) {
      toast({
        title: "Erro",
        description: "Por favor, realize a comparação primeiro.",
        variant: "destructive"
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', arquivo);

      const response = await fetch(
        `http://localhost:8000/verificar_notas?data_inicio=${dataInicio}&data_fim=${dataFim}&formato=excel`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) throw new Error('Erro ao exportar Excel');
      
      // Simular download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `comparacao_notas_${dataInicio}_${dataFim}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Arquivo Excel exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar Excel.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Instruções de Upload */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Instruções para Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-3">Faça upload de um arquivo Excel com as seguintes colunas:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white px-3 py-2 rounded border border-blue-200">
              <code className="text-blue-800 font-medium">numero</code>
            </div>
            <div className="bg-white px-3 py-2 rounded border border-blue-200">
              <code className="text-blue-800 font-medium">serie</code>
            </div>
            <div className="bg-white px-3 py-2 rounded border border-blue-200">
              <code className="text-blue-800 font-medium">quantidade</code>
            </div>
          </div>
          <p className="text-sm">
            <strong>Tamanho máximo:</strong> 200MB (arquivos muito grandes podem levar mais de 30 minutos para processar)
          </p>
        </CardContent>
      </Card>

      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Período para Comparação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload do Arquivo Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um arquivo Excel
            </h3>
            <p className="text-gray-500 mb-4">
              Arraste e solte aqui ou clique para selecionar
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-4"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Escolher arquivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {arquivo && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">{arquivo.name}</span>
                  <span className="text-green-600 text-sm">
                    ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Barra de Progresso */}
          {loading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Processando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button 
              onClick={verificarNotas}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verificando Notas...</span>
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verificar Notas
                </>
              )}
            </Button>
            
            <Button 
              onClick={exportarExcel}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Resultado para Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparacaoUpload;
