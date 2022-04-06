"""from dash import Dash, html, Input, Output
import pandas as pd
import plotly.express as px
import dash_dangerously_set_inner_html
from dash import dcc

def init_dashboard(server):
    ""Create a Plotly Dash dashboard.""
    dash_app = Dash(
        server=server,
        routes_pathname_prefix='/dashapp/',
        external_stylesheets=['/static/css/style.css'],
        title="Macka je laska moja jedina <3",
    )

    # Create Dash Layout
    dash_app.layout = html.Div([ 
    dash_dangerously_set_inner_html.DangerouslySetInnerHTML('''

        <header>

        <a class="logo" href="/">
            <img src=/static/svg/svg.svg alt="logo">
        </a>

        <nav>
        <ul class="nav__links">
            <li><a href="/about">O projekte</a></li>
            <li><a href="/dizajn">Dizajn</a></li>
            <li><a href="/dashapp">Inverzná kinematika</a></li>
        </ul>
        </nav>
        <a class="cta" href="#">Hlásenie chýb</a>
        </header>

    '''),
    
    html.Button('Print', id="printing"),
    html.Div(id='hidden-content'),
    dcc.Input(
        id="input_1",
        type="number",
        placeholder="dlzka..."
    ),

    html.Div(id="out-all-types"),
    html.Br(),
    dcc.Graph(id='robot_graph', figure={}),
])

    init_callbacks(dash_app)

    return dash_app.server


def init_callbacks(dash_app):
    @dash_app.callback(
    [Output("out-all-types", "children"),
    Output(component_id='robot_graph', component_property='figure')],
    [Input("input_1", "value")],
)

    def update_graph(input_1):
        df = pd.DataFrame(dict(X=[0, 0], Y=[0,0], Z=[0, input_1]))
        fig = px.line_3d(df, x='X', y='Y', z='Z')
        fig.update_layout(
            scene = dict(
            xaxis = dict(nticks=4, range=[-30,30],),
            yaxis = dict(nticks=4, range=[0,50],),
            zaxis = dict(nticks=4, range=[0,50],),),
            width=900, height=700,
            margin=dict(r=20, l=10, b=10, t=20), uirevision="Don't change",
        )
        return input_1, fig"""


