
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Package, Calendar, Database } from 'lucide-react';

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

interface ResumoCardsProps {
  dados: ApiResponse;
  dataInicio: string;
  dataFim: string;
}

const ResumoCards: React.FC<ResumoCardsProps> = ({ dados, dataInicio, dataFim }) => {
  const totalItens = dados.faltantes.reduce((sum, nota) => sum + nota.Quantidade, 0);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calcularDiasAnalise = () => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Notas no Banco */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total de Notas no Banco</p>
              <p className="text-3xl font-bold">{dados.total_no_banco.toLocaleString()}</p>
              <p className="text-blue-100 text-xs">notas fiscais encontradas</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Database className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total de Itens */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total de Itens</p>
              <p className="text-3xl font-bold">{totalItens.toLocaleString()}</p>
              <p className="text-green-100 text-xs">itens processados</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total de Notas no Arquivo */}
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total de Notas no Arquivo</p>
              <p className="text-3xl font-bold">{dados.total_no_arquivo.toLocaleString()}</p>
              <p className="text-purple-100 text-xs">notas no arquivo</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Período Analisado */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Período Analisado</p>
              <p className="text-3xl font-bold">{calcularDiasAnalise()}</p>
              <p className="text-orange-100 text-xs">
                {dataInicio && dataFim ? 
                  `${formatDate(dataInicio)} - ${formatDate(dataFim)}` : 
                  'dias de análise'
                }
              </p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumoCards;
