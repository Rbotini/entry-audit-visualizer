
import React, { useState } from 'react';
import { Calendar, Download, Upload, FileText, Package, Building, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import NotasTable from '@/components/NotasTable';
import ComparacaoUpload from '@/components/ComparacaoUpload';
import EstatisticasEmpresas from '@/components/EstatisticasEmpresas';
import ResumoCards from '@/components/ResumoCards';

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

const Index = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dados, setDados] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const consultarDados = async () => {
    if (!dataInicio || !dataFim) {
      toast({
        title: "Erro",
        description: "Por favor, selecione as datas de início e fim.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/verificar_notas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_inicio: dataInicio,
          data_fim: dataFim,
          formato: 'json'
        })
      });
      
      if (!response.ok) throw new Error('Erro ao consultar dados');
      
      const data = await response.json();
      setDados(data);
      
      toast({
        title: "Sucesso",
        description: "Dados consultados com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao consultar dados. Verifique a conexão com a API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComparacaoResult = (resultado: ApiResponse) => {
    setDados(resultado);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Conferência de Notas de Entrada
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros Globais */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Filtros de Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full"
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
                  className="w-full"
                />
              </div>
              <Button 
                onClick={consultarDados}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Consultando...</span>
                  </div>
                ) : (
                  'Consultar Dados'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Resumo */}
        {dados && (
          <ResumoCards 
            dados={dados}
            dataInicio={dataInicio}
            dataFim={dataFim}
          />
        )}

        {/* Estatísticas por Empresa */}
        {dados && dados.faltantes.length > 0 && (
          <EstatisticasEmpresas faltantes={dados.faltantes} />
        )}

        {/* Navegação por Abas */}
        <Tabs defaultValue="detalhadas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="detalhadas" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Notas Detalhadas</span>
            </TabsTrigger>
            <TabsTrigger value="comparacao" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Comparação (Arquivo x Banco)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="detalhadas" className="mt-6">
            <NotasTable notas={dados?.faltantes || []} />
          </TabsContent>

          <TabsContent value="comparacao" className="mt-6">
            <ComparacaoUpload onResult={handleComparacaoResult} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
