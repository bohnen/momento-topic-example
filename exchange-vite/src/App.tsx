import { useEffect, useState } from 'react';
import { Table } from './Table';
import { Execution, Rate, sendOrder, subscribeToRateTopic } from './momento/api';

// table default data
const defaultData: Execution[] = [];

function App() {
  const [price, setPrice] = useState<{ bid: number; ask: number }>({ bid: 0, ask: 0 });
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<'1' | '0.1' | '0.01'>('0.01');
  const [data, setData] = useState(() => [...defaultData])

  useEffect(() => {
    subscribeToRateTopic((message) => {
      const msg = JSON.parse(message.valueString()) as Rate;
      // console.log(msg);
      setPrice({
        bid: msg.best_bid,
        ask: msg.best_ask
      });
    },
    async (error) => {
      console.log(error.message);
    }
    );
  }, []);

  const placeOrder = (bs: 'buy' | 'sell') => {
    setOrderType(bs);
    sendOrder({side:bs, amount:parseFloat(amount), price:bs === 'buy' ? price.ask : price.bid}).then(
      (res) => {
        console.log(res);
        setData((prev) => [...prev, res]);
      });
  };

  return (
    <div className="App">
      <div className='container px-4 py-6'>
        <div className='grid  grid-cols-1 gap-4'>
          <div className='flex flex-row justify-center space-x-2'>
            <svg className="h-8 w-8" viewBox="0.004 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M63.04 39.741c-4.274 17.143-21.638 27.575-38.783 23.301C7.12 58.768-3.313 41.404.962 24.262 5.234 7.117 22.597-3.317 39.737.957c17.144 4.274 27.576 21.64 23.302 38.784z" fill="#f7931a"></path><path d="M46.11 27.441c.636-4.258-2.606-6.547-7.039-8.074l1.438-5.768-3.512-.875-1.4 5.616c-.922-.23-1.87-.447-2.812-.662l1.41-5.653-3.509-.875-1.439 5.766c-.764-.174-1.514-.346-2.242-.527l.004-.018-4.842-1.209-.934 3.75s2.605.597 2.55.634c1.422.355 1.68 1.296 1.636 2.042l-1.638 6.571c.098.025.225.061.365.117l-.37-.092-2.297 9.205c-.174.432-.615 1.08-1.609.834.035.051-2.552-.637-2.552-.637l-1.743 4.02 4.57 1.139c.85.213 1.683.436 2.502.646l-1.453 5.835 3.507.875 1.44-5.772c.957.26 1.887.5 2.797.726L27.504 50.8l3.511.875 1.453-5.823c5.987 1.133 10.49.676 12.383-4.738 1.527-4.36-.075-6.875-3.225-8.516 2.294-.531 4.022-2.04 4.483-5.157zM38.087 38.69c-1.086 4.36-8.426 2.004-10.807 1.412l1.928-7.729c2.38.594 10.011 1.77 8.88 6.317zm1.085-11.312c-.99 3.966-7.1 1.951-9.083 1.457l1.748-7.01c1.983.494 8.367 1.416 7.335 5.553z" fill="#ffffff"></path></g></svg> 
            <h1 className="text-3xl font-bold">Bitcoin Trade</h1>
          </div>
          <div className='flex flex-row justify-center space-x-4 '>
            <div className='overflow-hidden sg:rounded-lg shadow'>
              <div className='resize-none w-48 px-4 py-5 sm:p-6'>
                <dl>
                  <dt className="text-md leading-5 font-bold text-red-500 truncate">Bid</dt>
                  <dd className="mt-1 text-3xl leading-9 font-semibold text-gray-600">{price.bid.toLocaleString("en-US")}</dd>
                </dl>
              </div>
            </div>
            <div className='overflow-hidden sg:rounded-lg shadow'>
              <div className='resize-none w-48 px-4 py-5 sm:p-6'>
                <dl>
                  <dt className="text-md leading-5 font-bold text-blue-500 truncate">Ask</dt>
                  <dd className="mt-1 text-3xl leading-9 font-semibold text-gray-600">{price.ask.toLocaleString("en-US")}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className='flex flex-row justify-center space-x-2'>
            <h2>Amount</h2>
            <div className='flex items-center border border-gray-200 rounded px-2'> 
              <input  checked={amount === '1'} onChange={() => setAmount('1')} type="radio" id="1" name="amount" value="1" />
              <label className='ml-2' htmlFor="1">1</label>
            </div>
            <div className='flex items-center border border-gray-200 rounded px-2'> 
              <input checked={amount === '0.1'} onChange={() => setAmount('0.1')} type="radio" id="0.1" name="amount" value="0.1" />
              <label className='ml-2' htmlFor="0.1">0.1</label>
            </div>
            <div className='flex items-center border border-gray-200 rounded px-2'> 
              <input checked={amount === '0.01'} onChange={() => setAmount('0.01')} type="radio" id="0.01" name="amount" value="0.01" />
              <label className="ml-2" htmlFor="0.01">0.01</label>
            </div>
          </div>

          <div className='flex flex-row justify-center space-x-4'>
            <button type="button" className=" text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-lg px-20 py-2.5 text-center mb-2" onClick={() => placeOrder('sell')}>Sell</button>
            <button type="button" className=" text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg px-20 py-2.5 text-center mb-2" onClick={() => placeOrder('buy')}>Buy</button>

          </div>
          <div className='flex justify-center'>
            <Table data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
